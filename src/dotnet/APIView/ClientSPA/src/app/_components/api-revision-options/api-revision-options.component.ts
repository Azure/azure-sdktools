import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AUTOMATIC_ICON, getTypeClass, MANUAL_ICON, PR_ICON } from 'src/app/_helpers/common-helpers';
import { getQueryParams } from 'src/app/_helpers/router-helpers';
import { AzureEngSemanticVersion } from 'src/app/_models/azureEngSemanticVersion';
import { APIRevision } from 'src/app/_models/revision';

@Component({
  selector: 'app-api-revision-options',
  templateUrl: './api-revision-options.component.html',
  styleUrls: ['./api-revision-options.component.scss']
})
export class ApiRevisionOptionsComponent implements OnChanges {
  @Input() apiRevisions: APIRevision[] = [];
  @Input() activeApiRevisionId: string | null = '';
  @Input() diffApiRevisionId: string | null = '';

  mappedApiRevisions: any[] = [];
  activeApiRevisionsMenu: any[] = [];
  diffApiRevisionsMenu: any[] = [];
  selectedActiveAPIRevision: any;
  selectedDiffAPIRevision: any = null;

  manualIcon = MANUAL_ICON;
  prIcon = PR_ICON;
  automaticIcon = AUTOMATIC_ICON;

  activeApiRevisionsSearchValue: string = '';
  diffApiRevisionsSearchValue: string = '';

  activeApiRevisionsFilterValue: string | undefined = '';
  diffApiRevisionsFilterValue: string | undefined = '';

  filterOptions: any[] = [
    { label: 'Approved', value: 'approved' },
    { label: 'Released', value: 'released' },
    { label: 'Auto', icon: this.automaticIcon, value: 'automatic' },
    { label: 'PR', icon: this.prIcon, value: 'pullRequest' },
    { label: 'Manual', icon: this.manualIcon, value: 'manual' }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apiRevisions'] || changes['activeApiRevisionId'] || changes['diffApiRevisionId']) {
      if (this.apiRevisions.length > 0) {
        this.mappedApiRevisions = this.mapRevisionToMenu(this.apiRevisions);
        this.tagSpecialRevisions(this.mappedApiRevisions);

        this.activeApiRevisionsMenu = this.mappedApiRevisions.filter((apiRevision: any) => apiRevision.id !== this.diffApiRevisionId);
        const selectedActiveAPIRevisionindex = this.activeApiRevisionsMenu.findIndex((apiRevision: APIRevision) => apiRevision.id === this.activeApiRevisionId);
        this.selectedActiveAPIRevision = this.activeApiRevisionsMenu[selectedActiveAPIRevisionindex];

        this.diffApiRevisionsMenu = this.mappedApiRevisions.filter((apiRevision: any) => apiRevision.id !== this.activeApiRevisionId);
        const selectedDiffAPIRevisionindex = this.diffApiRevisionsMenu.findIndex((apiRevision: APIRevision) => apiRevision.id === this.diffApiRevisionId);
        if (selectedDiffAPIRevisionindex >= 0) {
          this.selectedDiffAPIRevision = this.diffApiRevisionsMenu[selectedDiffAPIRevisionindex];
        }
        else {
          this.selectedDiffAPIRevision = null;
        }
      }
    }
  }

  activeApiRevisionSearchFunction(event: KeyboardEvent) {
    this.activeApiRevisionsSearchValue = (event.target as HTMLInputElement).value;
    this.searchAndFilterDropdown(this.activeApiRevisionsSearchValue, this.activeApiRevisionsFilterValue, "active");
  }

  activeApiRevisionFilterFunction(event: any) {
    this.activeApiRevisionsFilterValue = event.value;
    this.searchAndFilterDropdown(this.activeApiRevisionsSearchValue, this.activeApiRevisionsFilterValue, "active");
  }

  activeApiRevisionChange(event: any) {
    let newQueryParams = getQueryParams(this.route);
    newQueryParams['activeApiRevisionId'] = event.value.id;
    this.router.navigate([], { queryParams: newQueryParams });
  }

  diffApiRevisionSearchFunction(event: KeyboardEvent) {
    this.diffApiRevisionsSearchValue = (event.target as HTMLInputElement).value;
    this.searchAndFilterDropdown(this.diffApiRevisionsSearchValue, this.diffApiRevisionsFilterValue, "diff");
  }

  diffApiRevisionFilterFunction(event: any) {
    this.diffApiRevisionsFilterValue = event.value;
    this.searchAndFilterDropdown(this.diffApiRevisionsSearchValue, this.diffApiRevisionsFilterValue, "diff");
  }

  diffApiRevisionChange(event: any) {
    let newQueryParams = getQueryParams(this.route);
    newQueryParams['diffApiRevisionId'] = event.value?.id;
    this.router.navigate([], { queryParams: newQueryParams });
  }

  diffApiRevisionClear(event: any) {
    let newQueryParams = getQueryParams(this.route);
    newQueryParams['diffApiRevisionId'] = null;
    newQueryParams['diffStyle'] = null;
    this.router.navigate([], { queryParams: newQueryParams });
  }

  searchAndFilterDropdown(searchValue : string, filterValue  : string | undefined, dropDownMenu : string) {
    let filtered = this.mappedApiRevisions.filter((apiRevision: APIRevision) => {
      switch (filterValue) {
        case 'pullRequest':
          return apiRevision.apiRevisionType === 'pullRequest';
        case 'manual':
          return apiRevision.apiRevisionType === 'manual';
        case 'automatic':
          return apiRevision.apiRevisionType === 'automatic';
        case 'released':
          return apiRevision.isReleased;
        case 'approved':
          return apiRevision.isApproved;
        default:
          return true;
      }
    });
    
    filtered = filtered.filter((apiRevision: APIRevision) => {
      return apiRevision.resolvedLabel.toLowerCase().includes(searchValue.toLowerCase());
    });

    if (dropDownMenu === "active") {
      this.activeApiRevisionsMenu = filtered.filter((apiRevision: APIRevision) => apiRevision.id !== this.diffApiRevisionId);
      if (this.selectedActiveAPIRevision && !this.activeApiRevisionsMenu.includes(this.selectedActiveAPIRevision)) {
        this.activeApiRevisionsMenu.unshift(this.selectedActiveAPIRevision);
      }
    }

    if (dropDownMenu === "diff") {
      this.diffApiRevisionsMenu = filtered.filter((apiRevision: APIRevision) => apiRevision.id !== this.activeApiRevisionId);
      if (this.selectedDiffAPIRevision && !this.diffApiRevisionsMenu.includes(this.selectedDiffAPIRevision)) {
        this.diffApiRevisionsMenu.unshift(this.selectedDiffAPIRevision);
      }
    }
  }

  resetDropDownFilter(dropDownMenu: string) {
    if (dropDownMenu === "active") {
      this.activeApiRevisionsSearchValue = '';
      this.activeApiRevisionsFilterValue = '';
      this.searchAndFilterDropdown(this.activeApiRevisionsSearchValue, this.activeApiRevisionsFilterValue, "active");
    }

    if (dropDownMenu === "diff") {
      this.diffApiRevisionsSearchValue = '';
      this.diffApiRevisionsFilterValue = '';
      this.searchAndFilterDropdown(this.diffApiRevisionsSearchValue, this.diffApiRevisionsFilterValue, "diff");
    }
  }

  mapRevisionToMenu(apiRevisions: APIRevision[]) {
    return apiRevisions
      .map((apiRevision: APIRevision) => {
      return {
        id : apiRevision.id,
        resolvedLabel: apiRevision.resolvedLabel,
        language: apiRevision.language,
        label: apiRevision.label,
        typeClass: getTypeClass(apiRevision.apiRevisionType),
        apiRevisionType: apiRevision.apiRevisionType,
        version: apiRevision.packageVersion,
        prNo: apiRevision.pullRequestNo,
        createdOn: apiRevision.createdOn,
        createdBy: apiRevision.createdBy,
        lastUpdatedOn: apiRevision.lastUpdatedOn,
        isApproved: apiRevision.isApproved,
        isReleased: apiRevision.isReleased,
        releasedOn: apiRevision.releasedOn,
        changeHistory: apiRevision.changeHistory,
        isLatestGA : false,
        isLatestApproved : false,
        isLatestMain : false,
        isLatestReleased : false,
        command: () => {
        }
      };
    });
  }

  tagSpecialRevisions(mappedApiRevisions: any []) {
    this.tagLatestGARevision(mappedApiRevisions);
    this.tagLatestApprovedRevision(mappedApiRevisions);
    this.tagCurrentMainRevision(mappedApiRevisions);
    this.tagLatestReleasedRevision(mappedApiRevisions);   
  }

  tagLatestGARevision(apiRevisions: any[]) {
    const gaRevisions : any [] = [];

    for (let apiRevision of apiRevisions) {
      if (apiRevision.isReleased && apiRevision.version) {
        const semVar = new AzureEngSemanticVersion(apiRevision.version, apiRevision.language);
        if (semVar.versionType == "GA") {
          apiRevision.semanticVersion = semVar;
          gaRevisions.push(apiRevision);
        }
      }
    }

    if (gaRevisions.length > 0) {
      gaRevisions.sort((a: any, b: any) => b.semanticVersion.compareTo(a.semanticVersion));
      gaRevisions[0].isLatestGA = true;
      this.updateTaggedAPIRevisions(apiRevisions, gaRevisions[0]);
      return gaRevisions[0];
    }
  }

  tagLatestApprovedRevision(apiRevisions: any[]) {
    const approvedRevisions : any [] = [];

    for (let apiRevision of apiRevisions) {
      if (apiRevision.isApproved && apiRevision.changeHistory.length > 0) {
        var approval = apiRevision.changeHistory.find((change: any) => change.changeAction === 'approved');
        if (approval) {
          apiRevision.approvedOn = approval.changedOn;
          approvedRevisions.push(apiRevision);
        }
      }
    }

    if (approvedRevisions.length > 0) {
      approvedRevisions.sort((a: any, b: any) => (new Date(b.approvedOn) as any) - (new Date(a.approvedOn) as any));
      approvedRevisions[0].isLatestApproved = true;
      this.updateTaggedAPIRevisions(apiRevisions, approvedRevisions[0]);
      return approvedRevisions[0];
    }
  }

  tagCurrentMainRevision(apiRevisions: any[]) {
    const automaticRevisions : any [] = [];

    for (let apiRevision of apiRevisions) {
      if (apiRevision.apiRevisionType === 'automatic') {
        automaticRevisions.push(apiRevision);
      }
    }

    if (automaticRevisions.length > 0) {
      automaticRevisions.sort((a: any, b: any) => (new Date(b.lastUpdatedOn) as any) - (new Date(a.lastUpdatedOn) as any));
      automaticRevisions[0].isLatestMain = true;
      this.updateTaggedAPIRevisions(apiRevisions, automaticRevisions[0]);
      return automaticRevisions[0];
    }
  }

  tagLatestReleasedRevision(apiRevisions: any[]) {
    const releasedRevisions : any [] = [];

    for (let apiRevision of apiRevisions) {
      if (apiRevision.isReleased) {
        releasedRevisions.push(apiRevision);
      }
    }

    if (releasedRevisions.length > 0) {
      releasedRevisions.sort((a: any, b: any) => (new Date(b.releasedOn) as any) - (new Date(a.releasedOn) as any));
      releasedRevisions[0].isLatestReleased = true;
      this.updateTaggedAPIRevisions(apiRevisions, releasedRevisions[0]);
      return releasedRevisions[0];
    }
  }

  private updateTaggedAPIRevisions(apiRevisions: any[], taggedApiRevision: any) {
    apiRevisions.splice(apiRevisions.indexOf(taggedApiRevision), 1)
    apiRevisions.unshift(taggedApiRevision);
  }
}

