// @types.data.tsx

export interface Data {
    id: string,
    title: string,
    url: string,
    description: string,
    image: string,
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
