import { Component, Input } from '@angular/core';
import { IAuthCardComponent } from '@modules/auth/interfaces';
import { AuthHeaderComponent } from '../auth-header';

@Component({
  selector: 'sctl-auth-card',
  standalone: true,
  templateUrl: './auth-card.component.html',
  styleUrls: ['./auth-card.component.scss'],
  imports: [
    AuthHeaderComponent
  ]
})
export class AuthCardComponent {
  @Input() config: IAuthCardComponent;
}
