import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAGIC_NUMBERS } from '@core/shared';
import { TranslateModule } from '@core/shared/modules';
import { REGEX } from '@shared/constants';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'sctl-email-selector',
  standalone: true,
  templateUrl: './email-selector.component.html',
  imports: [
    FormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
  ]
})
export class EmailSelectorComponent {

  public value = input<string[]>([]);

  public emailsChange = output<string[]>();
  public emails: string[] = [''];

  constructor() {
    effect(() => {
      const values = this.value() ?? [];
      this.emails = values.length ? [...values] : [''];
    });
  }

  public onEmailChange(index: number, email: string): void {
    this.emails[index] = email;
    this.emitValue();
  }

  public addEmail(): void {
    this.emails = [...this.emails, ''];
  }

  public removeEmail(index: number): void {
    if (this.emails.length <= 1) {
      return;
    }

    this.emails = this.emails.filter((_, emailIndex) => emailIndex !== index);
    this.emitValue();
  }

  public showInputError(index: number): boolean {
    if (!this.emails || this.emails?.length === MAGIC_NUMBERS.N_0) {
      return false;
    }

    const email = this.emails?.[index] ?? undefined;
    if (!email) {
      return false;
    }

    const emailRegex = new RegExp(REGEX.EMAIL);
    return !emailRegex.test(email);
  }

  public addButtonDisabled(): boolean {
    if (!this.emails || this.emails?.length === MAGIC_NUMBERS.N_0) {
      return false;
    }

    const emailRegex = new RegExp(REGEX.EMAIL);
    let allEmailsOk = true;
    this.emails.forEach(email => {
      if (!emailRegex.test(email)) {
        allEmailsOk = false;
      }
    });

    return allEmailsOk ? false : true;
  }

  private emitValue(): void {
    this.emailsChange.emit(this.emails.filter(email => Boolean(email.trim())));
  }
}