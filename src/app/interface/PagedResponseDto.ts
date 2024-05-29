export class PagedResponseDto<T> {
    data: T[] = [];
    totalRows: number = 0;
}