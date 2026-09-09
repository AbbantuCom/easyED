export interface LessonFormValues {
  date: string;
  klass: string;
  subject: string;
  theme: string;
  topic: string;
  duration: string;
  numLearners: string;
  competency: string;
  introduction: string;
  teacherActivities: string;
  learnerActivities: string;
  materials: string;
  assessment: string;
  conclusion: string;
  reflection: string;
}

export const BLANK_LESSON_VALUES: LessonFormValues = {
  date: '',
  klass: '',
  subject: '',
  theme: '',
  topic: '',
  duration: '',
  numLearners: '',
  competency: '',
  introduction: '',
  teacherActivities: '',
  learnerActivities: '',
  materials: '',
  assessment: '',
  conclusion: '',
  reflection: '',
};

export const LESSON_DETAIL_TEXT_FIELDS: {
  key: keyof Pick<
    LessonFormValues,
    | 'competency'
    | 'introduction'
    | 'teacherActivities'
    | 'learnerActivities'
    | 'materials'
    | 'assessment'
    | 'conclusion'
    | 'reflection'
  >;
  label: string;
}[] = [
  { key: 'competency', label: 'Learning competency / objective' },
  { key: 'introduction', label: 'Introduction' },
  { key: 'teacherActivities', label: 'Teacher activities' },
  { key: 'learnerActivities', label: 'Learner activities' },
  { key: 'materials', label: 'Teaching / learning materials' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'conclusion', label: 'Conclusion' },
  { key: 'reflection', label: 'Reflection / remarks' },
];
