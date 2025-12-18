import specializationsData from '../data/specializations.json';

export function getSpecializationBySubjects(subjects, faculty = '', department = '') {
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return null;
    }

    const specializationScores = specializationsData.map(spec => {
        let score = 0;
        const matchedSubjects = [];

        subjects.forEach(subject => {
            if (!subject || typeof subject !== 'string') return;

            const subjectLower = subject.toLowerCase().trim();

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

    specializationScores.sort((a, b) => b.score - a.score);

    const bestMatch = specializationScores[0];
    if (bestMatch && bestMatch.score > 0) {
        return bestMatch.specialization;
    }

    for (const spec of specializationsData) {
        for (const subject of subjects) {
            if (!subject || typeof subject !== 'string') continue;

            const subjectLower = subject.toLowerCase().trim();

            const specNameLower = spec.name.toLowerCase();
            const specCodeLower = spec.code.toLowerCase();

            if (subjectLower.includes(specNameLower) ||
                subjectLower.includes(specCodeLower) ||
                specNameLower.includes(subjectLower)) {
                return spec;
            }
        }
    }

    const text = `${(faculty || '').toLowerCase()} ${(department || '').toLowerCase()}`;
    if (text) {
        const findByCode = (code) => specializationsData.find(s => s.code === code) || null;
        if (/філолог/i.test(text) || /лінгв/i.test(text) || /мов/i.test(text)) return findByCode('Philology');
        if (/фізик/i.test(text)) return findByCode('Physics');
        if (/математ/i.test(text) || /прикладн.*матем/i.test(text)) return findByCode('Math');
        if (/істор/i.test(text)) return findByCode('History');
        if (/хім/i.test(text)) return findByCode('Chemistry');
        if (/інформат/i.test(text) || /комп.?ютер/i.test(text) || /програм/i.test(text)) {

            const subjStr = (subjects || []).join(' ').toLowerCase();
            const hasAIML = /машин|штучн|нейрон/i.test(subjStr);
            return findByCode(hasAIML ? 'AI/ML' : 'Web Dev');
        }
    }

    return null;
}

export function getTeacherSpecialization(teacher) {
    if (!teacher) return null;

    if (teacher.specialization) {
        return specializationsData.find(spec =>
            spec.code === teacher.specialization ||
            spec.name === teacher.specialization
        ) || null;
    }

    const subjects = teacher.subjects || (teacher.subject ? [teacher.subject] : []);
    return getSpecializationBySubjects(subjects, teacher.faculty, teacher.department);
}

