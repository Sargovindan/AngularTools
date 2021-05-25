import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subscription } from 'rxjs';
import { ProjectsService } from 'src/app/services/projects.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit, AfterViewInit {
  @ViewChildren('theLastList', { read: ElementRef })
  theLastList?: QueryList<ElementRef>;

  project$: Observable<any>;
  searchValue?: string;

  observer: any;

  currentPage: number = 1;
  totalPage: number;

  users: any;
  userSub: Subscription;

  constructor(
    private spinner: NgxSpinnerService,
    private ps: ProjectsService
  ) {}

  ngOnInit(): void {
    this.intersectionObserver();
    this.getUsers();
  }

  getUsers() {
    this.spinner.show();
    this.userSub = this.ps
      .getProjectUsers(this.currentPage)
      .pipe(
        tap(() => {
          this.spinner.hide();
        })
      )
      .subscribe((d) => {
        this.currentPage = d.page;
        this.totalPage = d.total_pages;

        if (this.currentPage == 1) {
          this.users = d.data;
        } else {
          d.data.forEach((element: any) => {
            this.users?.push(element);
          });
        }
      });
  }
  ngAfterViewInit() {
    this.theLastList?.changes.subscribe((d) => {
      if (d.last) this.observer.observe(d.last.nativeElement);
    });
  }

  intersectionObserver() {
    const option = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (this.currentPage < this.totalPage) {
          this.currentPage++;
          this.getUsers();
        }
      }
    }, option);
  }
}
