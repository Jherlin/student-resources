// @types.data.tsx

export interface Data {
    id: string,
    title: string,
    url: string,
    description: string,
    image: string,
    category: string,
    submitted_by: string,
    approval_pending: number
}

export interface DataProps {
  data: Data[],
  acceptRequest: any,
  declineRequest: any
}

export interface SearchResultsProps {
  searchResults: Data[]
}

export interface CommentData {
  id: string,
  content: string,
  time: string,
  resource_id: string,
  user_id: string
  name: string
}