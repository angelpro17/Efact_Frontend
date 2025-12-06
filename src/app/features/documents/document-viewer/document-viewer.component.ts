import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { environment } from '../../../../environments/environment';

type TabType = 'xml' | 'cdr' | 'pdf';

interface DocumentState {
    loading: boolean;
    error: string;
    content: string | SafeResourceUrl | null;
    blob: Blob | null;
}

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [
        CommonModule,
        LoadingSpinnerComponent,
        ErrorMessageComponent
    ],
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit {
    activeTab: TabType = 'pdf';
    ticket = environment.defaultCredentials.ticket;

    documents: Record<TabType, DocumentState> = {
        xml: { loading: false, error: '', content: null, blob: null },
        cdr: { loading: false, error: '', content: null, blob: null },
        pdf: { loading: false, error: '', content: null, blob: null }
    };

    constructor(
        private documentService: DocumentService,
        private authService: AuthService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.loadDocument('pdf');
    }

    setActiveTab(tab: TabType): void {
        this.activeTab = tab;

        if (!this.documents[tab].content && !this.documents[tab].loading) {
            this.loadDocument(tab);
        }
    }

    loadDocument(type: TabType): void {
        const doc = this.documents[type];
        doc.loading = true;
        doc.error = '';

        const serviceMethod = this.getServiceMethod(type);

        serviceMethod.subscribe({
            next: (blob: Blob) => {
                doc.blob = blob;

                if (type === 'pdf') {
                    const url = URL.createObjectURL(blob);
                    doc.content = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                } else {
                    this.readBlobAsText(blob, type);
                }

                doc.loading = false;
            },
            error: (error) => {
                doc.loading = false;
                doc.error = this.getErrorMessage(error, type);
            }
        });
    }

    private getServiceMethod(type: TabType) {
        switch (type) {
            case 'xml':
                return this.documentService.getXML(this.ticket);
            case 'cdr':
                return this.documentService.getCDR(this.ticket);
            case 'pdf':
                return this.documentService.getPDF(this.ticket);
        }
    }

    private readBlobAsText(blob: Blob, type: TabType): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.documents[type].content = reader.result as string;
        };
        reader.readAsText(blob);
    }

    downloadDocument(type: TabType): void {
        const doc = this.documents[type];

        if (doc.blob) {
            const filename = this.getFilename(type);
            this.documentService.downloadFile(doc.blob, filename);
        } else {
            this.loadDocument(type);
        }
    }

    private getFilename(type: TabType): string {
        const timestamp = new Date().getTime();
        return `${this.ticket}_${type}_${timestamp}.${type === 'pdf' ? 'pdf' : 'xml'}`;
    }

    private getErrorMessage(error: any, type: string): string {
        if (error.status === 404) {
            return `No se encontró el documento ${type.toUpperCase()}.`;
        } else if (error.status === 401) {
            return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        }
        return `Error al cargar el documento ${type.toUpperCase()}. Intenta nuevamente.`;
    }

    logout(): void {
        this.authService.logout();
    }

    get currentDocument(): DocumentState {
        return this.documents[this.activeTab];
    }
}
