import specializationsData from '../data/specializations.json';

/**
 * Визначає спеціалізацію викладача на основі предметів, які він веде
 * @param {Array<string>} subjects - Масив предметів викладача
 * @returns {Object|null} - Об'єкт спеціалізації або null, якщо не знайдено
 */
export function getSpecializationBySubjects(subjects, faculty = '', department = '') {
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return null;
    }

    // Підраховуємо скільки предметів відповідає кожній спеціалізації
    const specializationScores = specializationsData.map(spec => {
        let score = 0;
        const matchedSubjects = [];

        subjects.forEach(subject => {
            if (!subject || typeof subject !== 'string') return;
            
            const subjectLower = subject.toLowerCase().trim();
            
            // Перевіряємо чи предмет відповідає ключовим словам спеціалізації
            spec.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                if (subjectLower.includes(keywordLower) || keywordLower.includes(subjectLower)) {
                    score += 1;
                    if (!matchedSubjects.includes(subject)) {
                        matchedSubjects.push(subject);
                    }
                }
            });
        });

        return {
            specialization: spec,
            score,
            matchedSubjects
        };
    });

    // Сортуємо за кількістю співпадінь (найбільше співпадінь - перша)
    specializationScores.sort((a, b) => b.score - a.score);

    // Якщо найкраща спеціалізація має більше 0 співпадінь, повертаємо її
    const bestMatch = specializationScores[0];
    if (bestMatch && bestMatch.score > 0) {
        return bestMatch.specialization;
    }

    // Якщо не знайдено точного співпадіння, спробуємо знайти за частинами назв
    for (const spec of specializationsData) {
        for (const subject of subjects) {
            if (!subject || typeof subject !== 'string') continue;
            
            const subjectLower = subject.toLowerCase().trim();
            
            // Перевіряємо чи назва спеціалізації або код згадуються в предметі
            const specNameLower = spec.name.toLowerCase();
            const specCodeLower = spec.code.toLowerCase();
            
            if (subjectLower.includes(specNameLower) || 
                subjectLower.includes(specCodeLower) ||
                specNameLower.includes(subjectLower)) {
                return spec;
            }
        }
    }

    // Додаткові евристики за факультетом/кафедрою, якщо ключові слова з предметів не спрацювали
    const text = `${(faculty || '').toLowerCase()} ${(department || '').toLowerCase()}`;
    if (text) {
        const findByCode = (code) => specializationsData.find(s => s.code === code) || null;
        if (/філолог/i.test(text) || /лінгв/i.test(text) || /мов/i.test(text)) return findByCode('Philology');
        if (/фізик/i.test(text)) return findByCode('Physics');
        if (/математ/i.test(text) || /прикладн.*матем/i.test(text)) return findByCode('Math');
        if (/істор/i.test(text)) return findByCode('History');
        if (/хім/i.test(text)) return findByCode('Chemistry');
        if (/інформат/i.test(text) || /комп.?ютер/i.test(text) || /програм/i.test(text)) {
            // якщо в предметах є AI/ML ключі — повертаємо AI/ML, інакше Web Dev
            const subjStr = (subjects || []).join(' ').toLowerCase();
            const hasAIML = /машин|штучн|нейрон/i.test(subjStr);
            return findByCode(hasAIML ? 'AI/ML' : 'Web Dev');
        }
    }

    // Якщо нічого не знайдено, повертаємо null
    return null;
}

/**
 * Отримує спеціалізацію викладача з об'єкта викладача
 * @param {Object} teacher - Об'єкт викладача
 * @returns {Object|null} - Об'єкт спеціалізації або null
 */
export function getTeacherSpecialization(teacher) {
    if (!teacher) return null;

    // Якщо спеціалізація вже встановлена, повертаємо її
    if (teacher.specialization) {
        return specializationsData.find(spec => 
            spec.code === teacher.specialization || 
            spec.name === teacher.specialization
        ) || null;
    }

    // Якщо немає, визначаємо автоматично на основі subjects
    const subjects = teacher.subjects || (teacher.subject ? [teacher.subject] : []);
    return getSpecializationBySubjects(subjects, teacher.faculty, teacher.department);
}

