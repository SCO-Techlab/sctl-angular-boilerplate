import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardComponent } from '@core/components';
import { MAGIC_NUMBERS, SpinnerService, ToastService, TranslateModule, TranslateService } from '@core/shared';
import { EmailSelectorComponent, ResidenceRoomSelectorComponent, ResidencesSelectorComponent } from '@shared/components';
import { REGEX } from '@shared/constants';
import { IResidence, IResidenceRoomSelection } from '@shared/interfaces';
import { SelectTenantService, UserService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TabsModule } from 'primeng/tabs';
import { finalize } from 'rxjs';
import { INFORMATION_EMAILS_TABS } from '../../enums';
import { IInformationEmailsData } from '../../interfaces';
import { InformationEmailsService } from '../../services';

@Component({
  selector: 'sctl-information-emails',
  standalone: true,
  templateUrl: './information-emails.component.html',
  imports: [
    TranslateModule,
    TabsModule,
    CardComponent,
    DataViewModule,
    ButtonModule,
    EmailSelectorComponent,
    ResidenceRoomSelectorComponent,
    ResidencesSelectorComponent
  ]
})
export class InformationEmailsComponent implements OnInit {

  public readonly INFORMATION_EMAILS_TABS = INFORMATION_EMAILS_TABS;
  public currentTab: INFORMATION_EMAILS_TABS;

  public informationEmailsData: IInformationEmailsData;
  public selectedEmails: string[] = [];
  public selectedResidences: IResidence[] = [];
  public selectedResidenceRooms: IResidenceRoomSelection[] = [];

  private readonly EMAIL_PATTERN = new RegExp(REGEX.EMAIL);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly selectTenantService = inject(SelectTenantService);
  private readonly userService = inject(UserService);
  private readonly informationEmailsService = inject(InformationEmailsService);
  private readonly toastService = inject(ToastService);

  ngOnInit() {
    this.currentTab = this.INFORMATION_EMAILS_TABS.TENANT;
    this.listenToTenantChange();
  }

  public onTabChange($event: string | number): void {
    if ($event === this.currentTab) {
      return;
    }

    this.selectedEmails = [];
    this.selectedResidences = [];
    this.selectedResidenceRooms = [];
    this.currentTab = $event as INFORMATION_EMAILS_TABS;
  }

  public onEmailsChange(emails: string[]): void {
    this.selectedEmails = emails;
  }

  public onResidencesChange(residences: IResidence[]): void {
    this.selectedResidences = residences;
  }

  public onResidenceRoomsChange(selections: IResidenceRoomSelection[]): void {
    this.selectedResidenceRooms = selections;
  }

  public onClearData(): void {
    this.selectedEmails = [];
    this.selectedResidences = [];
    this.selectedResidenceRooms = [];
  }

  public sendEmail(): void {
    const filteredEmails: string[] = this.filterEmails(this.selectedEmails);
    const selectedTenant = this.selectTenantService.selectedTenant;
    const userId: string = this.userService.loggedUser()?._id;
    const residenceIds: string[] = this.selectedResidences?.map(residence => residence._id) || [];
    const roomIds: string[] = this.selectedResidenceRooms?.map(selection => selection.roomId) || [];

    const httpCalls = {
      [INFORMATION_EMAILS_TABS.TENANT]: this.informationEmailsService.sendOrganizationInformation(selectedTenant, userId, filteredEmails),
      [INFORMATION_EMAILS_TABS.RESIDENCES]: this.informationEmailsService.sendResidencesInformation(selectedTenant, userId, filteredEmails, residenceIds),
      [INFORMATION_EMAILS_TABS.ROOMS]: this.informationEmailsService.sendRoomsInformation(selectedTenant, userId, filteredEmails, roomIds),
      [INFORMATION_EMAILS_TABS.RESIDENCES_AND_ROOMS]: this.informationEmailsService.sendResidencesRoomsInformation(selectedTenant, userId, filteredEmails, this.selectedResidenceRooms),
    };

    this.spinnerService.show();
    httpCalls[this.currentTab]
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (response: boolean) => {
          if (!response) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.translateService.instant('PAGES.INFORMATION_EMAILS.SEND_EMAIL_KO'),
            });
            return;
          }

          this.onClearData();
          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.translateService.instant('PAGES.INFORMATION_EMAILS.SEND_EMAIL_OK'),
          });
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.translateService.instant('PAGES.INFORMATION_EMAILS.SEND_EMAIL_KO'),
          });
        }
      })
  }

  public sendButtonDisabled(): boolean {
    const filteredEmails: string[] = this.filterEmails(this.selectedEmails);
    const emailsOks = filteredEmails?.length > MAGIC_NUMBERS.N_0 ? false : true;
    const residencesOk = this.selectedResidences?.length > MAGIC_NUMBERS.N_0 ? false : true;

    if (this.currentTab === INFORMATION_EMAILS_TABS.TENANT) {
      return emailsOks;
    } else if (this.currentTab === INFORMATION_EMAILS_TABS.RESIDENCES) {
      return emailsOks || residencesOk;
    } else if (this.currentTab === INFORMATION_EMAILS_TABS.ROOMS || this.currentTab === INFORMATION_EMAILS_TABS.RESIDENCES_AND_ROOMS) {
      const residenceAndRoomsOk = this.selectedResidenceRooms?.length > MAGIC_NUMBERS.N_0 ? false : true;
      return emailsOks || residenceAndRoomsOk;
    }

    return true;
  }

  private filterEmails(emails: string[]): string[] {
    if (!emails || emails?.length <= MAGIC_NUMBERS.N_0) {
      return [];
    }

    const filtered = emails?.filter(email => email?.length > MAGIC_NUMBERS.N_0 && this.EMAIL_PATTERN.test(email));
    return filtered;
  }

  private listenToTenantChange(): void {
    this.selectTenantService.onTenantChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.onClearData();
          this.loadData();
        }
      })
  }

  private loadData(): void {
    this.informationEmailsService.getInformationEmailsData(this.selectTenantService.selectedTenant)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: IInformationEmailsData) => this.informationEmailsData = data,
        error: () => this.informationEmailsData = undefined
      })
  }
}
