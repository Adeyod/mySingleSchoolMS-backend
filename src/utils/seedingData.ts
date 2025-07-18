const sessionData = [
  {
    academic_session: '2023-2024',
    terms: [
      {
        name: 'first_term',
        start_date: new Date('2023-09-25'),
        end_date: new Date('2023-12-15'),
        is_active: false,
      },
      {
        name: 'second_term',
        start_date: new Date('2024-01-05'),
        end_date: new Date('2024-03-30'),
        is_active: true,
      },
      {
        name: 'third_term',
        start_date: new Date('2024-04-05'),
        end_date: new Date('2024-07-30'),
        is_active: true,
      },
    ],
    is_active: true,
    is_promotion_done: false,
  },
  {
    academic_session: '2022-2023',
    terms: [
      {
        name: 'first_term',
        start_date: new Date('2022-09-25'),
        end_date: new Date('2022-12-15'),
        is_active: false,
      },
      {
        name: 'second_term',
        start_date: new Date('2023-01-05'),
        end_date: new Date('2023-03-30'),
        is_active: false,
      },
      {
        name: 'third_term',
        start_date: new Date('2023-04-05'),
        end_date: new Date('2023-07-30'),
        is_active: true,
      },
    ],
    is_active: false,
    is_promotion_done: false,
  },
  {
    academic_session: '2021-2022',
    terms: [
      {
        name: 'first_term',
        start_date: new Date('2021-09-25'),
        end_date: new Date('2021-12-15'),
        is_active: false,
      },
      {
        name: 'second_term',
        start_date: new Date('2022-01-05'),
        end_date: new Date('2022-03-30'),
        is_active: false,
      },
      {
        name: 'third_term',
        start_date: new Date('2022-04-05'),
        end_date: new Date('2022-07-30'),
        is_active: true,
      },
    ],
    is_active: false,
    is_promotion_done: false,
  },
  {
    academic_session: '2020-2021',
    terms: [
      {
        name: 'first_term',
        start_date: new Date('2020-09-25'),
        end_date: new Date('2020-12-15'),
        is_active: false,
      },
      {
        name: 'second_term',
        start_date: new Date('2021-01-05'),
        end_date: new Date('2021-03-30'),
        is_active: false,
      },
      {
        name: 'third_term',
        start_date: new Date('2021-04-05'),
        end_date: new Date('2021-07-30'),
        is_active: true,
      },
    ],
    is_active: false,
    is_promotion_done: false,
  },
  {
    academic_session: '2019-2020',
    terms: [
      {
        name: 'first_term',
        start_date: new Date('2019-09-25'),
        end_date: new Date('2019-12-15'),
        is_active: false,
      },
      {
        name: 'second_term',
        start_date: new Date('2020-01-05'),
        end_date: new Date('2020-03-30'),
        is_active: false,
      },
      {
        name: 'third_term',
        start_date: new Date('2020-04-05'),
        end_date: new Date('2020-07-30'),
        is_active: true,
      },
    ],
    is_active: false,
    is_promotion_done: false,
  },
  {
    academic_session: '2018-2019',
    terms: [
      {
        name: 'first_term',
        start_date: new Date('2018-09-25'),
        end_date: new Date('2018-12-15'),
        is_active: false,
      },
      {
        name: 'second_term',
        start_date: new Date('2019-01-05'),
        end_date: new Date('2019-03-30'),
        is_active: false,
      },
      {
        name: 'third_term',
        start_date: new Date('2019-04-05'),
        end_date: new Date('2019-07-30'),
        is_active: true,
      },
    ],
    is_active: false,
    is_promotion_done: false,
  },
];

const classEnrolmentData = [
  {
    students: [
      {
        student: '6765188d2cb4b100c441fed6',
        subjects_offered: [
          '677511586c080204ac2b4d81',
          '677511cd6c080204ac2b4d8f',
          '677542733774e256a471dc7e',
          '6775428c3774e256a471dc93',
          '677542af3774e256a471dcaa',
          '677542c93774e256a471dcc3',
          '677542e73774e256a471dcde',
          '6775437d3774e256a471dd51',
          '677547523774e256a471defb',
          '6775478b3774e256a471df33',
        ],
      },
      {
        student: '676d2abd8b0681ad37a724f0',
        subjects_offered: [
          '677511586c080204ac2b4d81',
          '677511cd6c080204ac2b4d8f',
          '677542733774e256a471dc7e',
          '6775428c3774e256a471dc93',
          '677542af3774e256a471dcaa',
          '677542c93774e256a471dcc3',
          '677542e73774e256a471dcde',
          '6775437d3774e256a471dd51',
          '677547523774e256a471defb',
          '6775478b3774e256a471df33',
        ],
      },
    ],
    class: '677548383774e256a471e068',
    level: 'JSS 1',
    academic_session_id: '677bf9ddafc50abc196477af',
    term: 'second_term',
    all_subjects_offered_in_the_class: [],
    status: 'enrolled',
  },
];

export { sessionData, classEnrolmentData };
