import {Post} from "./post.model";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {t} from "../../../node_modules/@angular/core/src/render3";
import {Router} from "@angular/router";
import {stringDistance} from "../../../node_modules/codelyzer/util/utils";

@Injectable({providedIn:'root'})
//creates a singleton postservice in the whole application
export class PostsService {
  private posts : Post[] = [];
  private postsUpdated = new Subject<{posts : Post[], totalPosts : number}>();

  //bind it to private property iof this typescript class
  constructor(private httpClient : HttpClient, private router : Router){}

  //ANGULAR-ONLY-APP-CODE
  // getPosts() {
  //   //passing in the copy of the object as we dont want all the components that have a reference to posts to add new posts or delete posts
  //   return [...this.posts]
  //
  //   // other way - passes reference of posts which lets all the components that has access to edit posts based on the reference
  //   // return this.posts;
  // }

  //ANGULAR-WITH-NODE-CONNECTION-CODE

  // we use pipe operation here as an operator on observables to map backend object to front end object
  //in this case, we had _id in backend that needed mapping to id of frontend
  getPosts(pagesize : number, page : number) {
    const queryParams = `?page=${page}&pagesize=${pagesize}`;
    this.httpClient.get<{message: string, posts : any, totalPosts : number}>("http://localhost:3000/api/posts" + queryParams)
      // .pipe( map( (postData) => {
      //   return postData.posts.map(post => {
      //     return {
      //       title : post.title,
      //       content : post.content,
      //       id: post._id
      //     }
      //   })
      // } ))
      .subscribe( (transformedPosts) => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({posts:[...this.posts],totalPosts : transformedPosts.totalPosts});
      });
  }

  getpost(id : string) {
    //returns a new java script object with the same copied values from original object
    //since in javascript/amngular when a object is returned, it's reference of document and we can modify it

    return this.httpClient.get<{message:string, post : Post}>("http://localhost:3000/api/posts/"+id);
  }






  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  //ANGULAR-NODE-ADD-POST
  addPost(title: string, content : string, image : File) {


    // const postObj: Post = {_id: null, title: title, content : content};


    // this.httpClient.post<{postResponse : Post, message : string}>("http://localhost:3000/api/posts", postObj)
    //   .subscribe((responseData) => {
    //     console.log(responseData.message);
    //     this.posts.push(responseData.postResponse);
    //     this.postsUpdated.next([...this.posts]);
    //     this.router.navigate(["/"]);
    //     }
    //   )
    //

    //json cant include a file, so we need to send formdata;


    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    console.log('postData: ' + postData);

    this.httpClient.post<{ message: string, postResponse: Post }>("http://localhost:3000/api/posts", postData)
      .subscribe((responseData) => {
          console.log(responseData.message);
          this.posts.push(responseData.postResponse);
          this.postsUpdated.next({posts : [...this.posts], totalPosts : this.posts.length});
          this.router.navigate(["/"]);
        }
      );
  }

  updatePost(id: string, title: string, content : string, image : File | string) {
    let postData;
    if(typeof(image) == 'object') {
      //we have a image file , create form object
      postData = new FormData();
      postData.append("id",id);
      postData.append("title",title);
      postData.append("image", image);
      postData.append("content", content);
    } else {
      // send json data to update
      postData = {_id : id, title : title, content : content, imagePath : image};

    }
    this.httpClient.put<{message : string, post : Post}>("http://localhost:3000/api/posts/"+id, postData).subscribe(
      response => {

        //updating the posts locally
        // const updatedposts   = [...this.posts];
        // const index = updatedposts.findIndex(post => post._id == id);
        // updatedposts[index] = response.post;
        // this.posts = updatedposts;
        // this.postsUpdated.next(this.posts);
        console.log(response.message);
        this.router.navigate(["/"]);

      }
    )

  }


  //ANGULAR-ONLY-ADD-POST
  // addPost(title: string, content : string) {
  //   const post: Post = {id: null, title: title, content : content};
  //       this.posts.push(post);
  //       //letting the subscribers know that posts have been updated using next method
  //       this.postsUpdated.next([...this.posts]);
  // }



  deletePosts(id: string) {
   return this.httpClient.delete<{message : string}>("http://localhost:3000/api/posts/"+id);
      // .subscribe((responseData) => {
      //   const updatedPosts = this.posts.filter(posts => posts._id !== id);
      //   this.posts = updatedPosts;
      //   this.postsUpdated.next({posts : this.posts, totalPosts : this.posts.length});
      //   console.log("deleted!");
      //   console.log(responseData.message);
      // });
  }
}
