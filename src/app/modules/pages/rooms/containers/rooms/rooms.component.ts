import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CrudComponent } from '@core/components';
import { ImagesGalleriaDialogComponent } from '@core/dialogs/images-galleria-dialog';
import { BUTTON_SEVERITY, ConfirmDialogService, CRUD_ACTIONS, CRUD_COLUMN_ALIGNMENT, CRUD_COLUMN_TYPE, CRUD_DEFAULT_TABLE_ACTION, CRUD_DELETE_TABLE_ACTION, CRUD_EDIT_TABLE_ACTION, CRUD_STATE, DATES, DatesService, FILE_SIZES, ICrudComponent, ICrudPaginationEvent, ICrudTableAction, IImagesGalleriaDialogComponent, IPaginationQuery, IPaginationResponse, ITranslateLiterals, MAGIC_NUMBERS, SpinnerService, ToastService, TranslateModule, TranslateService, XlsxService } from '@core/shared';
import { environment } from '@environment';
import { ResidencesService } from '@modules/pages/residences/services';
import { PERMISSIONS } from '@shared/constants';
import { PERMISSION_TYPE } from '@shared/enums/permissions/permissions.enum';
import { cleanObject, formatResidenceAddress } from '@shared/helpers';
import { IRoom } from '@shared/interfaces';
import { SelectTenantService, UserService } from '@shared/services';
import { finalize } from 'rxjs';
import { RoomsFiltersFormComponent, RoomsFormComponent } from '../../components';
import { RoomsService } from '../../services';

@Component({
  selector: 'sctl-rooms',
  standalone: true,
  templateUrl: './rooms.component.html',
  imports: [
    TranslateModule,
    CrudComponent,
    RoomsFormComponent,
    RoomsFiltersFormComponent,
    ImagesGalleriaDialogComponent,
  ]
})
export class RoomsComponent {
  @ViewChild('filtersForm', { static: false }) filtersForm!: RoomsFiltersFormComponent;

  public showTable = false;
  public crudValues: IRoom[] = [];
  public crudState: CRUD_STATE = CRUD_STATE.VIEW;
  public crudConfig: ICrudComponent;
  public selectedItem: IRoom;
  public formValid: boolean = false;
  public filtersValue: Partial<IRoom> = {};

  public showImagesGalleriaDialog: boolean = false;
  public imagesGalleriaDialogConfig: IImagesGalleriaDialogComponent;

  private literals: ITranslateLiterals;
  private selectedItemId: string;
  private paginationQuery: IPaginationQuery = { page: MAGIC_NUMBERS.N_1, limit: MAGIC_NUMBERS.N_5 };

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly roomsService = inject(RoomsService);
  private readonly residencesService = inject(ResidencesService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly xlsxService = inject(XlsxService);
  private readonly datesService = inject(DatesService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly selectTenantService = inject(SelectTenantService);

  ngOnInit() {
    this.translateService.stream('ROOMS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCrudConfig();
        this.getValues();
      });

    this.selectTenantService.onTenantChange$
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.resetCrud());
  }

  public onNew(): void {
    this.selectedItem = {
      tenant: undefined,
      residence: undefined,
      name: '',
      beds: 1,
      images: [],
    } as IRoom;
    this.selectedItemId = undefined;
    this.crudState = CRUD_STATE.NEW;
  }

  public onDeleteMultiple(values: string[]): void {
    if (!values?.length) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE_MULTIPLE']?.['HEADER'],
      message: this.literals?.['DELETE_MULTIPLE']?.['MESSAGE'],
      rejectButton: { label: this.literals?.['DELETE_MULTIPLE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE_MULTIPLE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.roomsService.deleteMultiple(values)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => this.spinnerService.hide())
          )
          .subscribe({
            next: (res: number) => {
              if (!res) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: this.literals?.['DELETE_MULTIPLE']?.['ERROR']
                });
                return;
              }

              if (res !== values.length) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: `${this.literals?.['DELETE_MULTIPLE']?.['ERROR']} (${res}/${values.length})`
                });
              } else {
                this.toastService.success({
                  summary: this.translateService.instant('TOAST.SUCCESS'),
                  detail: this.literals?.['DELETE_MULTIPLE']?.['SUCCESS']
                });
              }
              this.resetCrud();
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.literals?.['DELETE_MULTIPLE']?.['ERROR']
              });
            }
          });
      }
    });
  }

  public async onExportData(): Promise<void> {
    const values = await new Promise<IRoom[]>((resolve) => {
      this.roomsService.find(null)
        .pipe(takeUntilDestroyed(this.destroyRef$))
        .subscribe({
          next: (res: IRoom[]) => resolve(res ?? []),
          error: () => resolve([])
        })
    });

    if (!values?.length) {
      this.toastService.info({
        summary: this.translateService.instant('TOAST.INFO'),
        detail: this.translateService.instant('COMMON.NO_EXPORT_DATA')
      });
      return;
    }

    const formatData = values.map((item: IRoom) => {
      return {
        ['_id']: item._id,
        [this.literals?.['COLS']['TENANT']]: item.tenant?.name ?? '',
        [this.literals?.['COLS']['RESIDENCE']]: item.residence ? `${item.residence?.street ?? ''} ${item.residence?.number ?? ''}`.trim() : '',
        [this.literals?.['COLS']['NAME']]: item.name ?? '',
        [this.literals?.['COLS']['BEDS']]: item.beds ?? '',
        [this.literals?.['COLS']['CREATED_AT']]: item.createdAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.createdAt) : '',
        [this.literals?.['COLS']['UPDATED_AT']]: item.updatedAt ? this.datesService.formatDate(DATES.ISO_DATETIME, item.updatedAt) : ''
      }
    });

    this.xlsxService.exportAsExcel(
      formatData,
      this.literals?.['FILENAME'],
      this.xlsxService.createStandardColsInfo(formatData)
    );
  }

  public onSelectAction(action: ICrudTableAction): void {
    if (!action?.name) {
      return;
    }

    const actionMethods = {
      ['images']: () => {
        this.selectedItem = structuredClone(action?.value);
        this.selectedItemId = action?.value?._id;
        this.setImagesGalleriaConfig();
        this.showImagesGalleriaDialog = true;
        this.cdRef.detectChanges();
      },
      [CRUD_ACTIONS.EDIT]: () => {
        this.selectedItem = structuredClone(action?.value);
        this.selectedItemId = action?.value?._id;
        this.crudState = CRUD_STATE.EDIT;
        this.cdRef.detectChanges();
      },
      [CRUD_ACTIONS.DELETE]: this.delete.bind(this)
    };

    actionMethods?.[action.name]?.(action.value);
  }

  public onFormValueChange($event: IRoom): void {
    this.selectedItem = {
      ...this.selectedItem,
      ...structuredClone($event)
    };
  }

  public onCloseFormDialog(isSubmit: boolean): void {
    if (!isSubmit) {
      this.selectedItem = undefined;
      this.selectedItemId = undefined;
      this.crudState = CRUD_STATE.VIEW;
      this.cdRef.detectChanges();
      return;
    }

    const formValue: IRoom = structuredClone(this.selectedItem);
    const currentTenant = this.userService.userTenants().find(t => t._id === this.selectTenantService.selectedTenant);
    formValue.tenant = currentTenant;
    if (this.crudState === CRUD_STATE.NEW) {
      this.add(formValue);
    } else {
      this.edit(this.selectedItemId, formValue);
    }
  }

  public onPagination(paginationEvent: ICrudPaginationEvent): void {
    this.paginationQuery.page = paginationEvent.page;
    this.paginationQuery.limit = paginationEvent.limit;
    this.getValues();
  }

  public onClearFilters(): void {
    this.filtersValue = {};
    this.filtersForm?.clearForm();
    this.getValues();
  }

  public onSearchFilters(): void {
    this.getValues();
  }

  public onUploadImages(files: File[]): void {
    if (this.roomsService.validateMaxImagesPerRoom(files)) {
      this.toastService.error({
        summary: this.translateService.instant('TOAST.ERROR'),
        detail: this.literals?.['IMAGES']['MAX_IMAGES_ALLOWED']
      });
      return;
    }

    if (this.roomsService.validateMaxImageSize(files)) {
      this.toastService.error({
        summary: this.translateService.instant('TOAST.ERROR'),
        detail: this.literals?.['IMAGES']['MAX_IMAGE_SIZE']
      });
      return;
    }

    this.spinnerService.show();
    this.roomsService.addRoomImages(this.selectedItem?._id, files)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (room: IRoom) => {
          if (!room) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['IMAGES']['UPDATE_KO']
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['IMAGES']['UPDATE_OK']
          });
          this.selectedItem = structuredClone(room);
          this.getValues();
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['IMAGES']['UPDATE_KO'],
          })
        }
      })
  }

  public onDeleteImage(imageIndex: number): void {
    const imageId = this.selectedItem?.images?.[imageIndex] ?? '';
    this.spinnerService.show();
    this.roomsService.deleteRoomImage(this.selectedItem?._id, imageId)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (room: IRoom) => {
          if (!room) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['IMAGES']?.['DELETE_KO']
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['IMAGES']?.['DELETE_OK']
          });
          this.selectedItem = structuredClone(room);
          this.getValues();
        },
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['IMAGES']?.['DELETE_KO']
          });
        }
      });
  }

  private getValues(): void {
    this.showTable = false;
    const filter: Partial<IRoom> = Object.values(cleanObject(this.filtersValue))?.length
      ? this.filtersValue
      : null;
    this.roomsService.find(filter, this.paginationQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.showTable = true)
      )
      .subscribe((res: IPaginationResponse<IRoom>) => {
        this.crudValues = res?.data ?? [];
        this.crudConfig.pagination.totalRecords = res?.totalRecords;
        this.crudConfig.pagination.first = res?.first;
        this.crudConfig.pagination.rows = res?.limit;
      });
  }

  private add(value: IRoom): void {
    this.spinnerService.show();
    this.roomsService.save(value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IRoom) => {
          if (!res) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['ADD']?.['ERROR']
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['ADD']?.['SUCCESS']
          });
          this.resetCrud();
        },
        error: (error: HttpErrorResponse) => this.errorAddOrEdit(error, false)
      });
  }

  private delete(value: IRoom): void {
    if (!value) {
      return;
    }

    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value.name} (${formatResidenceAddress(value.residence)})</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.roomsService.delete(value)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => this.spinnerService.hide())
          )
          .subscribe({
            next: (res: boolean) => {
              if (!res) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: this.literals?.['DELETE']?.['ERROR']
                });
                return;
              }

              this.toastService.success({
                summary: this.translateService.instant('TOAST.SUCCESS'),
                detail: this.literals?.['DELETE']?.['SUCCESS']
              });
              this.resetCrud();
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.literals?.['DELETE']?.['ERROR']
              });
            }
          });
      }
    });
  }

  private edit(_id: string, value: IRoom): void {
    this.spinnerService.show();
    this.roomsService.update(_id, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (res: IRoom) => {
          if (!res) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['EDIT']?.['ERROR']
            });
            return;
          }

          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['EDIT']?.['SUCCESS']
          });
          this.resetCrud();
        },
        error: (error: HttpErrorResponse) => this.errorAddOrEdit(error, true)
      });
  }

  private setCrudConfig(): void {
    this.crudConfig = {
      toolbarEnabled: true,
      filtersEnabled: true,
      onlyTable: false,
      tableActions: [
        {
          ...CRUD_DEFAULT_TABLE_ACTION,
          name: 'images',
          icon: 'pi pi-image'
        },
        { ...CRUD_EDIT_TABLE_ACTION },
        { ...CRUD_DELETE_TABLE_ACTION }
      ],
      newValueButtonEnabled: true,
      multipleDeleteButtonEnabled: true,
      exportButtonEnabled: true,
      searchInputEnabled: false,
      cols: [
        {
          header: this.literals?.['COLS']['RESIDENCE'],
          field: 'residence',
          type: CRUD_COLUMN_TYPE.CALLBACK,
          options: {
            callback: {
              fn: (value: IRoom) => value?.residence
                ? `${value.residence?.street ?? ''} ${value.residence?.number ?? ''}`.trim()
                : ''
            }
          }
        },
        {
          header: this.literals?.['COLS']['NAME'],
          field: 'name'
        },
        {
          header: this.literals?.['COLS']['BEDS'],
          field: 'beds',
          fieldAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          headerAlign: CRUD_COLUMN_ALIGNMENT.CENTER,
          headerStyles: 'max-width: 7rem',
          fieldStyles: 'max-width: 7rem'
        },
        {
          header: this.literals?.['COLS']['CREATED_AT'],
          field: 'createdAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } },
          headerStyles: 'min-width: 165px',
          fieldStyles: 'min-width: 165px',
        },
        {
          header: this.literals?.['COLS']['UPDATED_AT'],
          field: 'updatedAt',
          type: CRUD_COLUMN_TYPE.DATE,
          options: { date: { format: DATES.ISO_DATETIME } },
          headerStyles: 'min-width: 165px',
          fieldStyles: 'min-width: 165px',
        },
      ],
      globalFilterFields: ['name', 'beds'],
      dataKey: '_id',
      titleKeys: ['name'],
      modalTitle: (value: IRoom) => `${value.name} (${formatResidenceAddress(value.residence)})`,
      rowHover: true,
      paginator: true,
      showCurrentPageReport: true,
      pagination: {
        ajaxPagination: true,
        rowsPerPageOptions: [MAGIC_NUMBERS.N_5, MAGIC_NUMBERS.N_10, MAGIC_NUMBERS.N_20, MAGIC_NUMBERS.N_30],
        rows: MAGIC_NUMBERS.N_5,
        totalRecords: null,
        first: null
      },
      disableSubmitButton: () => !this.formValid,
      literals: {
        TITLE: this.literals?.['TITLE'],
        FORM_NEW: this.literals?.['FORM_NEW'],
        FORM_EDIT: this.literals?.['FORM_EDIT']
      },
      disabledButtons: {
        [CRUD_ACTIONS.NEW]: () => !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.CREATE),
        [CRUD_ACTIONS.DELETE_MULTIPLE]: () => !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.DELETE_BULK),
        [CRUD_ACTIONS.EXPORT]: () => !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.GLOBAL_FILTER]: () => !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.READ),
        [CRUD_ACTIONS.EDIT]: () => !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.UPDATE),
        [CRUD_ACTIONS.DELETE]: () => !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.DELETE),
        [CRUD_ACTIONS.CLEAR_FILTERS]: () => {
          return (
            !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.READ) ||
            Object.values(cleanObject(this.filtersValue))?.length === MAGIC_NUMBERS.N_0
          );
        },
        [CRUD_ACTIONS.SEARCH_FILTERS]: () => !this.userService.hasPermission(PERMISSIONS.ROOMS, PERMISSION_TYPE.READ),
      }
    };
  }

  private resetCrud(): void {
    this.getValues();
    this.selectedItem = undefined;
    this.selectedItemId = undefined;
    this.crudState = CRUD_STATE.VIEW;
  }

  private errorAddOrEdit(error: HttpErrorResponse, isEdit: boolean): void {
    const translateBlock: string = isEdit ? 'EDIT' : 'ADD';
    const errorMessage: string = (error.error?.message as string);
    const duplicatedKeyError: string = 'Duplicate key error collection';
    let detail: string = this.literals?.[translateBlock]?.['ERROR'];

    if (errorMessage?.startsWith(duplicatedKeyError)) {
      const split: string[] = errorMessage?.split(duplicatedKeyError);
      detail = `${this.literals?.[translateBlock]?.['DUPLICATE']} ${split?.[MAGIC_NUMBERS.N_1]}`;
    }

    this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
  }

  private setImagesGalleriaConfig(): void {
    const imagesSrc = `${environment.apiUrl}/rooms/get/image/${this.selectedItem?._id}/{imageId}/${this.selectTenantService.selectedTenant}`;

    this.imagesGalleriaDialogConfig = {
      dialogConfig: {
        closeOnSubmit: false,
        header: {
          closable: true,
          title: this.literals?.['IMAGES']?.['TITLE'],
          subTitle: `${this.selectedItem.name} (${formatResidenceAddress(this.selectedItem.residence)})`
        },
        footer: {
          cancelButton: {
            show: true,
            label: this.literals?.['IMAGES']?.['CANCEL'],
            severity: BUTTON_SEVERITY.SECONDARY,
            outlined: true,
            text: false,
            rounded: false,
            disabled: undefined
          },
          submitButton: {
            show: false,
            label: '',
            severity: BUTTON_SEVERITY.PRIMARY,
            outlined: true,
            text: false,
            rounded: false
          }
        }
      },
      imagesGalleriaConfig: {
        showLabel: false,
        showAddImageButton: true,
        showDeleteImageButton: true,
        showImageTitleIndex: true,
        maxFileSizeMb: FILE_SIZES.MB_5,
        maxFiles: MAGIC_NUMBERS.N_5,
      },
      imagesSrc: imagesSrc
    }
  }
}