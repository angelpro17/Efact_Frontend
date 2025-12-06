import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LoadingSpinnerComponent,
        ErrorMessageComponent
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    errorMessage = '';
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(5)]],
            password: ['', [Validators.required, Validators.minLength(10)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.markFormGroupTouched(this.loginForm);
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const { username, password } = this.loginForm.value;

        this.authService.login(username, password).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/documents']);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.getErrorMessage(error);
            }
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    private getErrorMessage(error: any): string {
        if (error.status === 401) {
            return 'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.';
        } else if (error.status === 0) {
            return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
        return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
    }

    get username() {
        return this.loginForm.get('username');
    }

    get password() {
        return this.loginForm.get('password');
    }
}
