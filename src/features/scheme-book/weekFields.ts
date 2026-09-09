export interface WeekFormValues {
  week: number;
  theme: string;
  topic: string;
  competency: string;
  teacherActivities: string;
  learnerActivities: string;
  materials: string;
  assessment: string;
  remarks: string;
}

export const BLANK_WEEK_VALUES: Omit<WeekFormValues, 'week'> = {
  theme: '',
  topic: '',
  competency: '',
  teacherActivities: '',
  learnerActivities: '',
  materials: '',
  assessment: '',
  remarks: '',
};

export const WEEK_TEXT_FIELDS: { key: keyof Omit<WeekFormValues, 'week'>; label: string }[] = [
  { key: 'theme', label: 'Theme' },
  { key: 'topic', label: 'Topic' },
  { key: 'competency', label: 'Competency / Learning outcome' },
  { key: 'teacherActivities', label: 'Teacher activities' },
  { key: 'learnerActivities', label: 'Learner activities' },
  { key: 'materials', label: 'Teaching / learning materials' },
  { key: 'assessment', label: 'Assessment / Evaluation' },
  { key: 'remarks', label: 'Remarks' },
];
