import {AuthService} from "../../services/authService"
import {autoinject} from 'aurelia-framework';

@autoinject()
export class Login {
    email: string;
    password: string;
    errors: string[] = [];

    constructor(private authService: AuthService) { }

    async submit() {
        this.errors = [];

        const response = await this.authService.login(this.email, this.password);
        if (response.status === 401) {
            this.errors.push("Username and password did not match a valid user.");
        } else if (response.status !== 200) {
            this.errors.push("An unknown error occurred, please contact the system administrator.");
        }
    }
}