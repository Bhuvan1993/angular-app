import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import {Post} from "../post.model";
import {FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {PostsService} from "../posts.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {mimeType} from "./mime-type.validator";

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit{

  //USING ANGULAR TEMPLATE FORMS
  // private mode = 'create';
  // private postId : string;
  //
  // public post : Post;
  //
  // isLoading = false;
  //
  //
  // ngOnInit() {
  //   //For all the built in observables we don't need to unsubscribe
  //   //this is an observable because the parameter in the url can change and we might be editing a different postid
  //   this.route.paramMap.subscribe((paramMap: ParamMap) => {
  //     if(paramMap.has('postId')) {
  //       this.mode = 'edit';
  //       this.postId = paramMap.get('postId');
  //       this.isLoading = true;
  //       this.postsService.getpost(this.postId).subscribe(postResponse => {
  //         this.isLoading = false;
  //         this.post = postResponse.post});
  //     } else {
  //       this.mode = 'create';
  //       this.postId = null;
  //     }
  //   });
  //
  // }
  //
  // constructor(public postsService : PostsService, public route : ActivatedRoute){}
  //
  // // emitting an event to parent component from child component which will be captured through event binding
  // // @Output()
  // // postCreated = new EventEmitter<Post>();
  //
  // onSavePost(postForm: NgForm) {
  //
  //   if (postForm.invalid) {
  //     return;
  //   }
  //   this.isLoading = true;
  //   const post: Post = {
  //     _id : this.postId,
  //     title: postForm.value.title,
  //     content: postForm.value.content
  //   };
  //
  //   if(this.postId == null) {
  //     // this.postCreated.emit(post);
  //     this.postsService.addPost(post.title, post.content);
  //     postForm.resetForm();
  //   } else {
  //     this.postsService.updatePost(this.postId, post.title, post.content);
  //   }
  //
  // }



  postId : string;

  isLoading = false;

  post : Post;

  // USING REACTIVE APPROACH

  //top level obj of form
  form : FormGroup;

  imagePreview : string;

  constructor(public postService : PostsService, public route : ActivatedRoute) {}

  ngOnInit() {
    this.form = new FormGroup({
      //null is the initial value and next are validators and you can also specify when the validators are supposed to be executed
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null,
        {validators: [Validators.required]}),
      'image' : new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });


    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postService.getpost(this.postId).subscribe(postInfo => {
          this.isLoading = false;
          this.post = postInfo.post;
          console.log(this.post);

          //set value is used to set all the form values
          // whereas patch value is only used to set one value and not reset other values of the form
          this.form.setValue(
            {
              title: this.post.title,
              content: this.post.content,
              image : this.post.imagePath,
            }
          );
        });

      } else {
        this.postId = null;
      }
    });
  }


    onSavePost(){
      if(this.form.invalid) {
        return;
      }
      this.isLoading = true;

      if(this.postId == null) {
        console.log(this.form.value.image);
        this.postService.addPost(this.form.value.title,this.form.value.content, this.form.value.image);
      } else {
        this.postService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image)
      }
      this.form.reset();
    }

  onImagePicked(event : Event) {
    //file object
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({
      image : file
    });
    //letting angular know that we updated the form value so that it can reload the DOM and validate the new value
    this.form.get('image').updateValueAndValidity();
    //creating reader
    const reader = new FileReader();
    //defining a function which has toi be executed when its done loading a image
    //async func
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    //kick off the the async call once its done loading this file
    reader.readAsDataURL(file);
  }






}
