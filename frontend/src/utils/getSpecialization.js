import specializationsData from '../data/specializations.json';

/**
 * Визначає спеціалізацію викладача на основі предметів, які він веде
 * @param {Array<string>} subjects - Масив предметів викладача
 * @returns {Object|null} - Об'єкт спеціалізації або null, якщо не знайдено
 */
export function getSpecializationBySubjects(subjects) {
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
    return getSpecializationBySubjects(subjects);
}

