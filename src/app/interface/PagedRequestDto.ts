export class PagedRequestDto{
    lastId: number = 0;
    pageSize: number = 0;
    startRow: number = 0;
    endRow: number = 0;
    filterText: string | null = null
}