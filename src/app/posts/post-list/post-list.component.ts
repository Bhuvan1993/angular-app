import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Post} from "../post.model";
import {PostsService} from "../posts.service";
import {Subscription} from "rxjs";
import {PageEvent} from "@angular/material";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{

  // posts = [
  //   {title : 'First Post', content: 'first post content'},
  //   {title : 'second Post', content: 'second post content'},
  //   {title : 'last Post', content: 'last post content'},
  // ];

  // listening for
  // @Input()
  // posts: Post[] = [
  //
  // ];

  posts: Post[] = [];
  private postsSub : Subscription;
  isLoading = false;
  totalPosts;
  postsPerPage = 2;
  pageSizeOptions = [1,2,5,10];
  currentPage = 1;
  constructor(public postsService: PostsService) {}

  //basic initialization tasks here
  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage,this.currentPage);
    this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData :{posts: Post[], totalPosts : number})=> {
      this.posts = postData.posts;
      this.totalPosts = postData.totalPosts;
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  onDelete(id : string) {
    this.postsService.deletePosts(id)
      .subscribe(() =>
      {
        this.postsService.getPosts(this.postsPerPage,this.currentPage);
      })
  }

  onChangedPage(pageData : PageEvent) {
    console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts( this.postsPerPage,this.currentPage);

  }

}
