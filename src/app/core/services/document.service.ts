import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private readonly baseUrl = `${environment.apiUrl}/v1`;

    constructor(private http: HttpClient) { }

    getCDR(ticket: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/cdr/${ticket}`, {
            responseType: 'blob'
        });
    }

    getXML(ticket: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/xml/${ticket}`, {
            responseType: 'blob'
        });
    }

    getPDF(ticket: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/pdf/${ticket}`, {
            responseType: 'blob'
        });
    }

    downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}
