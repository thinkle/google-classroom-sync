export function getActiveUserEmail(): string {
  return "thinkle@innovationcharter.org";
}

export function testMe(number: number): number {
  return 17;
}

export function foo(s: string): number {
  return 17;
}



export function getApiId(): string {
  return process.env.VITE_ASPEN_API_ID;
}

export {
  testApiCall,  
  fetchTeacherByEmail,
  fetchLineItems,
  fetchAspenCourses,
  fetchCategories,
  fetchGradingPeriods,
  createLineItem,
  fetchAspenRoster,
  postGrade
} from "../../gas/aspen";

import {
  fetchTeacherByEmail
} from '../../gas/aspen';


export function fetchGoogleAssessments(courseId: any): GoogleAppsScript.Classroom.Schema.CourseWork[] {
  return [
    {
      creatorUserId: "113561106451202000689",
      creationTime: "2024-09-10T19:35:09.725Z",
      submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN",
      assignment: {
        studentWorkFolder: {
          id: "1q_XGWHE6w8D98j13DHihiwm6SK80ONa0MMJlqqOEywHtJvtxsyHrFCK5sagAedvGhgxXmdGu",
        },
      },
      description:
        'You can work in partners or alone\nWe will be doing the "choose your own adventure" assignment!',
      updateTime: "2024-09-11T12:56:29.717Z",
      title: "Choose Your Own Adventure Assignment",
      maxPoints: 100,
      materials: [
        {
          link: {
            title: "Sign in to GitHub · GitHub",
            url: "https://classroom.github.com/a/6XwuExH9",
            thumbnailUrl:
              "https://classroom.google.com/webthumbnail?url=https://classroom.github.com/a/6XwuExH9",
          },
        },
        {
          youtubeVideo: {
            alternateLink: "https://www.youtube.com/watch?v=_YPh2hvlTXI",
            id: "_YPh2hvlTXI",
            title: "Choose Your Own Adventure Starter (Codespaces)",
            thumbnailUrl: "https://i.ytimg.com/vi/_YPh2hvlTXI/default.jpg",
          },
        },
      ],
      workType: "ASSIGNMENT",
      alternateLink:
        "https://classroom.google.com/c/NzA3NTExMjMwNDk2/a/NzEyMTYxNzA5Mjkw/details",
      state: "PUBLISHED",
      id: "712161709290",
      assigneeMode: "ALL_STUDENTS",
      courseId: "707511230496",
    },
    {
      creatorUserId: "113561106451202000689",
      creationTime: "2024-09-09T17:03:28.756Z",
      submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN",
      assignment: {
        studentWorkFolder: {
          id: "1EIdtNy_2ud8hoazaaUzq4zJvIukE8nuu1-aHnZ1TwmCGomRsITb1-qkwFnhuLbRPIG9xOefd",
        },
      },
      updateTime: "2024-09-11T10:23:37.239Z",
      title: "Intro Quiz",
      materials: [
        {
          form: {
            responseUrl:
              "https://docs.google.com/spreadsheets/d/1vNhSIyE_ozYbsvJgQVfMAI5JZYEoXhQhYhq56q5071U?resourcekey=&usp=emb&urp=[urp]#gid=1504225065",
            title: "HTML & CSS Basics",
            formUrl:
              "https://docs.google.com/forms/d/1NiUbvkFoY_Lz8xH4ocVQvvbqccNDGudBpfxZZOy4pnk/edit",
            thumbnailUrl:
              "https://lh6.googleusercontent.com/k72gpYlA8y2SdBetTbIj2Cw6cy96gZVF9AzcyZQQT1Zv3CKoJ5yVZD6Y1BTefsxTBdaJzsVu3Tw=w90-h90-p",
          },
        },
      ],
      maxPoints: 48,
      workType: "ASSIGNMENT",
      alternateLink:
        "https://classroom.google.com/c/NzA3NTExMjMwNDk2/a/NzExODQ0ODg1Mjg4/details",
      id: "711844885288",
      state: "PUBLISHED",
      assigneeMode: "ALL_STUDENTS",
      courseId: "707511230496",
    },
    {
      creatorUserId: "113561106451202000689",
      creationTime: "2024-08-29T14:33:34.226Z",
      submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN",
      assignment: {
        studentWorkFolder: {
          title: "Name Card",
          alternateLink:
            "https://drive.google.com/drive/folders/1uwQCflR6ixIlhfxnxKD9Qbv7zpCWApSf_ejPbWKVuY5Tq86IwkYzAx-rAQQJIyffG92h4sF6",
          id: "1uwQCflR6ixIlhfxnxKD9Qbv7zpCWApSf_ejPbWKVuY5Tq86IwkYzAx-rAQQJIyffG92h4sF6",
        },
      },
      dueDate: {
        month: 9,
        year: 2024,
        day: 4,
      },
      description: "We will be working on a name card this class!",
      updateTime: "2024-09-06T17:35:12.177Z",
      title: "Name Card",
      dueTime: {
        hours: 13,
        minutes: 20,
      },
      materials: [
        {
          driveFile: {
            shareMode: "VIEW",
            driveFile: {
              alternateLink:
                "https://docs.google.com/document/d/1-NpEFXZOTEfqP4ZNe328j6548klqJVQQpKZOFixCQ4E/edit?usp=drive_web",
              id: "1-NpEFXZOTEfqP4ZNe328j6548klqJVQQpKZOFixCQ4E",
              title: "Name Card Instructions",
              thumbnailUrl:
                "https://lh3.google.com/drive-storage/AJQWtBPmMyK8QUPdlFViE3Gg5hI8Suipw1k6rGVm96pCbt1Je93M5bpa9dVUEnYu2PCKUDQC-tFtJXW7zhILdbTvlQQBiPowV9gsF7v8X3z2GJ3FiJTxMvs2V002fblAY9OXgGwccAo=s200",
            },
          },
        },
        {
          driveFile: {
            shareMode: "STUDENT_COPY",
            driveFile: {
              alternateLink:
                "https://docs.google.com/document/d/1TU25IV6vyOKllqdyXZe524n_hMGsNZbKQ8zcOqAslbo/edit?usp=drive_web",
              id: "1TU25IV6vyOKllqdyXZe524n_hMGsNZbKQ8zcOqAslbo",
              title: "Notes & Documentation",
              thumbnailUrl:
                "https://lh3.google.com/drive-storage/AJQWtBOolhNmgMzT034WRnVVewWriUzcold-2un4DizvwrzuRXoSXEPWd5ZgpWCOxlAnHxvOuP-jw_OBMBqsz7rlehzBWHlWNgG3wSEnaLC3MmI5i8Lx1EDbSluGnidCtfKysooCj-8=s200",
            },
          },
        },
        {
          link: {
            title: "Google Forms: Sign-in",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSf4IT0IAkuHy6NOSaqEHjFRuYK4Gbht4kvQ8LG-YEdxfh0yHw/viewform",
            thumbnailUrl:
              "https://classroom.google.com/webthumbnail?url=https://docs.google.com/forms/d/e/1FAIpQLSf4IT0IAkuHy6NOSaqEHjFRuYK4Gbht4kvQ8LG-YEdxfh0yHw/viewform",
          },
        },
      ],
      maxPoints: 4,
      workType: "ASSIGNMENT",
      alternateLink:
        "https://classroom.google.com/c/NzA3NTExMjMwNDk2/a/NzA5MDMyNDg5MTEw/details",
      state: "PUBLISHED",
      id: "709032489110",
      assigneeMode: "ALL_STUDENTS",
      courseId: "707511230496",
    },
    {
      creatorUserId: "113561106451202000689",
      creationTime: "2024-09-06T15:25:09.844Z",
      submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN",
      assignment: {
        studentWorkFolder: {
          title: "Review",
          alternateLink:
            "https://drive.google.com/drive/folders/1c-kDHP8PNYvwLFOz5o03g7vFAie9lmRA5bTSAc0_bxWkHEdsAa53-4k6sBa17YJxi3hXAdhi",
          id: "1c-kDHP8PNYvwLFOz5o03g7vFAie9lmRA5bTSAc0_bxWkHEdsAa53-4k6sBa17YJxi3hXAdhi",
        },
      },
      dueDate: {
        month: 9,
        year: 2024,
        day: 7,
      },
      updateTime: "2024-09-06T15:25:25.982Z",
      dueTime: {
        hours: 3,
        minutes: 59,
      },
      title: "Review",
      materials: [
        {
          driveFile: {
            shareMode: "STUDENT_COPY",
            driveFile: {
              alternateLink:
                "https://docs.google.com/document/d/1KrDdKkzNUYwlXG_tCE7-cbyiO-jq8e6KYsVW_ZYGl14/edit?usp=drive_web",
              id: "1KrDdKkzNUYwlXG_tCE7-cbyiO-jq8e6KYsVW_ZYGl14",
              title: "Review Concepts: week one",
              thumbnailUrl:
                "https://lh3.google.com/drive-storage/AJQWtBPyEu_2DXnPxkBUaE7SxgVo-URBlezts2rN_M2eD1p3_nWGB1IwEX_SQaWlP97le6bV6ondwJnb4iTc6bVBeCCMnXltFMq29wybCX3GVVWDJjDSBg63pTB17Am-B8P7kZE9JkM=s200",
            },
          },
        },
      ],
      workType: "ASSIGNMENT",
      alternateLink:
        "https://classroom.google.com/c/NzA3NTExMjMwNDk2/a/NzExMzkzMjAxMzU1/details",
      state: "PUBLISHED",
      id: "711393201355",
      courseId: "707511230496",
      assigneeMode: "ALL_STUDENTS",
    },
    {
      creatorUserId: "113561106451202000689",
      creationTime: "2024-09-04T13:01:41.172Z",
      submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN",
      assignment: {
        studentWorkFolder: {
          title: "Set up GitHub Codepsaces",
          alternateLink:
            "https://drive.google.com/drive/folders/1dLqiw40f9E-xHBYOa8fnrGokgiKM7D3ouyjpT-0A9hvMueB5MD9T0mMqOT4WtdW_PRERg_nn",
          id: "1dLqiw40f9E-xHBYOa8fnrGokgiKM7D3ouyjpT-0A9hvMueB5MD9T0mMqOT4WtdW_PRERg_nn",
        },
      },
      dueDate: {
        month: 9,
        year: 2024,
        day: 12,
      },
      description:
        "[we will go through this next week, but if you want to try starting early and give me feedback on my instructions so I can make this smoother and better for other students, have at it!]\n",
      updateTime: "2024-09-04T13:08:40.432Z",
      title: "Set up GitHub Codepsaces",
      dueTime: {
        hours: 3,
        minutes: 59,
      },
      materials: [
        {
          driveFile: {
            shareMode: "VIEW",
            driveFile: {
              alternateLink:
                "https://docs.google.com/document/d/1SAqS9g2bJZsC14YsjTEvScjaORML5IwAkP8V9VEEJbE/edit?usp=drive_web",
              id: "1SAqS9g2bJZsC14YsjTEvScjaORML5IwAkP8V9VEEJbE",
              title: "Github Godespaces Instructions - Web Design",
              thumbnailUrl:
                "https://lh3.google.com/drive-storage/AJQWtBNbg-DnT2Kr5lQ5LVrTmhZm5JCDvpohMdURuAflB6_Kitwm9cXWF5S-pPshsdmcietWPL4LjgVXoTMeHb5fb9IsIv8CLJJF9PC4m9wY-xQF5LSthb45-rHpJjw6U0_JGl7X-oc=s200",
            },
          },
        },
      ],
      maxPoints: 100,
      workType: "ASSIGNMENT",
      alternateLink:
        "https://classroom.google.com/c/NzA3NTExMjMwNDk2/a/NzEwODA5NDY1MTMy/details",
      id: "710809465132",
      state: "PUBLISHED",
      courseId: "707511230496",
      assigneeMode: "ALL_STUDENTS",
    },
    {
      creatorUserId: "113561106451202000689",
      creationTime: "2024-08-28T01:15:50.999Z",
      submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN",
      assignment: {
        studentWorkFolder: {
          id: "1Z4KiLoNc0u1jqsktWU6ePXQnlrTr-oNDhRP4nsCt_FnFR7lUKa0_pjpkvA6bWbf1fmpCW0TR",
        },
      },
      updateTime: "2024-08-29T14:15:38.673Z",
      title: "First Letter",
      materials: [
        {
          driveFile: {
            shareMode: "VIEW",
            driveFile: {
              alternateLink:
                "https://docs.google.com/document/d/1954sJGYr6prdwZvvnOrPROqtHrqtP59O-9QW77X-fRw/edit?usp=drive_web",
              id: "1954sJGYr6prdwZvvnOrPROqtHrqtP59O-9QW77X-fRw",
              title: "Letter Assignment Instructions",
              thumbnailUrl:
                "https://lh3.google.com/drive-storage/AJQWtBPXpgtoBFg2h-Kg9243BN9BNX63wGbX_TnZXFxYtTzSokIz_yY-ciSAAw3HUaFjn6K5pK-RlxnkU4QRlI82z85eR-Xb2nG97H92OJRSygP_ShyrSYaibhese9TVDT69RlY9E-g=s200",
            },
          },
        },
      ],
      workType: "ASSIGNMENT",
      alternateLink:
        "https://classroom.google.com/c/NzA3NTExMjMwNDk2/a/NzA4NzUzMDQyNjU1/details",
      state: "PUBLISHED",
      id: "708753042655",
      courseId: "707511230496",
      assigneeMode: "ALL_STUDENTS",
    },
  ];
}

export function fetchGoogleCourses(teacherEmail: any): any[] {
  return [{ id: "foo", title: "Course 1" },
  { id: "bar", title: "Course 2" }]; // TODO: Replace with mock return value of type any[]  
}

export function fetchGoogleGrades(courseId: any, assessmentId: any): Grade[] {
  return [
    {
      studentEmail: "student1@example.com",
      draftGrade: 3.67,
      assignedGrade: 3.67,
      submissionState: "RETURNED",
      maximumGrade: 4,
      studentName: "Student One",
    },
    {
      draftGrade: 2.25,
      studentEmail: "student2@example.com",
      assignedGrade: 2.25,
      submissionState: "RETURNED",
      studentName: "Student Two",
      maximumGrade: 4,
    },
    {
      studentEmail: "student3@example.com",
      draftGrade: 3.67,
      assignedGrade: 3.67,
      submissionState: "RETURNED",
      studentName: "Student Three",
      maximumGrade: 4,
    },
    {
      studentEmail: "student4@example.com",
      draftGrade: 2.5,
      assignedGrade: 2.5,
      submissionState: "RETURNED",
      maximumGrade: 4,
      studentName: "Student Four",
    },
    {
      draftGrade: 3,
      studentEmail: "student5@example.com",
      assignedGrade: 3,
      submissionState: "RETURNED",
      maximumGrade: 4,
      studentName: "Student Five",
    },
    {
      studentEmail: "student6@example.com",
      submissionState: "CREATED",
      late: true,
      maximumGrade: 4,
      studentName: "Student Six",
    },
    {
      draftGrade: 3,
      studentEmail: "student7@example.com",
      assignedGrade: 3,
      submissionState: "RETURNED",
      studentName: "Student Seven",
      maximumGrade: 4,
    },
    {
      draftGrade: 3,
      studentEmail: "student8@example.com",
      assignedGrade: 3,
      submissionState: "RETURNED",
      studentName: "Student Eight",
      maximumGrade: 4,
    },
    {
      studentEmail: "student9@example.com",
      draftGrade: 2.33,
      assignedGrade: 2.33,
      submissionState: "RETURNED",
      studentName: "Student Nine",
      maximumGrade: 4,
    },
    {
      draftGrade: 1.67,
      studentEmail: "student10@example.com",
      assignedGrade: 1.67,
      submissionState: "RETURNED",
      studentName: "Student Ten",
      maximumGrade: 4,
    },
    {
      studentEmail: "student11@example.com",
      draftGrade: 2,
      assignedGrade: 2,
      submissionState: "TURNED_IN",
      studentName: "Student Eleven",
      maximumGrade: 4,
    },
    {
      studentEmail: "student12@example.com",
      draftGrade: 1.5,
      assignedGrade: 1.5,
      submissionState: "RETURNED",
      studentName: "Student Twelve",
      maximumGrade: 4,
    },
    {
      studentEmail: "student13@example.com",
      draftGrade: 3.67,
      assignedGrade: 3.67,
      submissionState: "RETURNED",
      studentName: "Student Thirteen",
      maximumGrade: 4,
    },
    {
      draftGrade: 3.33,
      studentEmail: "student14@example.com",
      assignedGrade: 3.33,
      submissionState: "RETURNED",
      maximumGrade: 4,
      studentName: "Student Fourteen",
    },
    {
      studentEmail: "student15@example.com",
      submissionState: "CREATED",
      late: true,
      maximumGrade: 4,
      studentName: "Student Fifteen",
    },
    {
      studentEmail: "student16@example.com",
      draftGrade: 2.6,
      assignedGrade: 2.6,
      submissionState: "RETURNED",
      studentName: "Student Sixteen",
      maximumGrade: 4,
    },
    {
      draftGrade: 2.83,
      studentEmail: "student17@example.com",
      assignedGrade: 2.83,
      submissionState: "RETURNED",
      studentName: "Student Seventeen",
      maximumGrade: 4,
    },
    {
      draftGrade: 2.4,
      studentEmail: "student18@example.com",
      assignedGrade: 2.4,
      submissionState: "RETURNED",
      studentName: "Student Eighteen",
      maximumGrade: 4,
    },
  ];
  
}

export function fetchAspenTeacher(): Promise<User> {
  return fetchTeacherByEmail('thinkle@innovationcharter.org');
}


