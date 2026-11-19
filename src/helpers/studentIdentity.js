const STUDENT_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isStudentUuid = (value) => typeof value === "string" && STUDENT_UUID_PATTERN.test(value);

/** Monitor APIs bind the Student UUID, never a display-list or user ID. */
export function studentIdFrom(candidate) {
  const values = [
    candidate?.student?.id,
    candidate?.user?.student?.id,
    candidate?.studentId,
    candidate?.student_id,
    candidate?.id,
  ];

  return values.find(isStudentUuid) ?? null;
}
