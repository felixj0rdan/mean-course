import { Component, OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "src/app/auth/auth.service";

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
    // posts = [
    //     { title: 'First', content: 'first post' },
    //     { title: 'Second', content: 'second post' },
    //     { title: 'Third', content: 'third post' },
    // ]

    posts: Post[] = [];
    isLoading = false;
    totalPosts = 0;
    postsPerPage = 2;
    currentPage = 1;
    pageSizeOptions = [1, 2, 5, 10];
    userIsAuthenticated = false;
    userId: string;
    private postsSub: Subscription;
    private AuthStatusSub: Subscription;

    constructor(public postsService: PostsService, private authService: AuthService) { }
    ngOnInit() {
        this.isLoading = true;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.userId = this.authService.getUserId();
        this.postsSub = this.postsService
            .getPostsUpdateListener()
            .subscribe((postData: {posts: Post[], postCount: number}) => {
                this.isLoading = false;
                this.totalPosts = postData.postCount;
                this.posts = postData.posts;
            });
            this.userIsAuthenticated = this.authService.getIsAuth();
        this.AuthStatusSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
        });
    }

    onChangedPage(pageDate: PageEvent) {
        // console.log(pageDate);
        this.isLoading = true;
        this.currentPage = pageDate.pageIndex + 1;
        this.postsPerPage = pageDate.pageSize;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        
    }

    onDelete(postId: string) {
        this.isLoading = true;
        this.postsService.deletePost(postId).subscribe(() => {
            this.postsService.getPosts(this.postsPerPage, this.currentPage)
        }, () => {
            this.isLoading = false;
        });
    }

    ngOnDestroy(): void {
        this.postsSub.unsubscribe();
        this.AuthStatusSub.unsubscribe();
    }


};