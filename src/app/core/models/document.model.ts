export enum DocumentType {
    XML = 'xml',
    CDR = 'cdr',
    PDF = 'pdf'
}

export interface DocumentResponse {
    data: Blob;
    filename: string;
    type: DocumentType;
}
