//all validators are just functions that validates
import {AbstractControl} from "@angular/forms";
import {observable, Observable, Observer, of} from "rxjs";


//sync validator
//returns null for a valid value and returns error code and value pair for invalid values;

//async validator
export const mimeType = (control : AbstractControl) : Promise<{[key : string] : any}> | Observable<{[key : string] : any}>  => {

  if(typeof(control.value) === 'string') {
    //easy way to create observable which is valid
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();


  const filereaderObservable = Observable.create((observer : Observer<{[key : string] : any}>) => {
    console.log("mime validation: ");
    fileReader.addEventListener("loadend", () => {
      const arr = new Uint8Array(fileReader.result).subarray(0,4);
      let header = "";
      for( let i = 0 ; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      let isValid  = false;
      switch (header) {
        case "89504e47":
          isValid = true;
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }
      if(isValid) {
        observer.next(null);
      } else {
        observer.next({invalidMimeType : true});
      }
      observer.complete();
    });

    fileReader.readAsArrayBuffer(file);
  });

  return filereaderObservable;
};
