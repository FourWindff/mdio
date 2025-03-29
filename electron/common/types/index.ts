export enum SortType {
  ALPHABETICAL_ASC = "alphabeticalAsc",
  ALPHABETICAL_DESC = "alphabeticalDesc",
  CREATED_TIME_ASC = "createdTimeAsc",
  CREATED_TIME_DESC = "createdTimeDesc",
  MODIFIED_TIME_ASC = "modifiedTimeAsc",
  MODIFIED_TIME_DESC = "modifiedTimeDesc",
}
export enum FileStatus {
  ERROR = "error",
  EXPANDED = "expanded",
  UNEXPANDED = "unexpanded",
}
export const IMAGE_TYPE = [".png", ".jpg", ".jpeg", ".gif", "svg"];
export const TEXT_TYPE = [".md", ".lexical"];
export const LEGAL_TYPE = [...IMAGE_TYPE, ...TEXT_TYPE];