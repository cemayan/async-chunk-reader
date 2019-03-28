import fs from "fs";
import path from "path"
import readline from "readline"
import zlib from "zlib"
import { Stream, Readable } from "stream";
import events from "events";
import yauzl from "yauzl";




export interface InitParameters{
    chunkSize : number,
    encoding? : string,
    inputFile : String|Stream,
    selectedFileName? :String,
    specialChunkSize?:{[key: number]: number },
    skipRows? : number
}

export interface ReaderParameters{
    input_file : String|Stream
}

interface IteratorResult<T> {
    done: boolean;
    value?: T;
}
interface AsyncIterator<T> {
    next(value?: any): Promise<IteratorResult<T>>;
    return?(value?: any): Promise<IteratorResult<T>>;
    throw?(e?: any): Promise<IteratorResult<T>>;
}

interface AsyncIterableIterator<T> extends AsyncIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}


interface IterableInterface {
    [Symbol.asyncIterator]():  any
     next(): Promise<IteratorResult<object>>;
}


events.EventEmitter.defaultMaxListeners = 1000;
//let chunkCounter = 0 ;

export  function init(parameters : InitParameters =  {chunkSize : 10000, encoding : "utf8", inputFile: "", selectedFileName: "", specialChunkSize: {}, skipRows: 0}) {

    return {async get(){

        let fileStream;
        let zipFileStream ;

        if(typeof(parameters.inputFile) == "string"){
            if(path.extname(<string>parameters.inputFile)==".gz"){
                const gunzip = zlib.createGunzip()
                fileStream = fs.createReadStream(<string>parameters.inputFile).pipe(gunzip);
           } 
            else if(path.extname(<string>parameters.inputFile)==".zip"){

                zipFileStream =  new Promise((resolve,reject) => {
                yauzl.open(<string>parameters.inputFile, {lazyEntries: true}, function(err, zipfile) {
                    if (err) throw err;
                    zipfile.readEntry();
                
                    zipfile.on("entry", function(entry) {

                        zipfile.openReadStream(entry,function(err, readStream) {
                            if (err){
                                reject(err);
                            }
                            if(entry.fileName === parameters.selectedFileName){
                            resolve(readStream);
                            }             
                            zipfile.readEntry();
                        })
    
                    });

                  });
                })  
            }
            else{
                fileStream = fs.createReadStream(<string>parameters.inputFile,{ encoding:parameters.encoding });
            }

            const rl =readline.createInterface({
                input: typeof(zipFileStream) === "undefined" ?  fileStream : await zipFileStream,
            });
        
            let async_itr:AsyncIterableIterator<{}> = rl[Symbol.asyncIterator]();   
            
            if(parameters.hasOwnProperty("skipRows")) {
                async_itr = skipRow(parameters,async_itr);
            }

            return  readLineByStream(parameters,async_itr); 
        }  
        else if(parameters.inputFile instanceof Stream ){
            fileStream = parameters.inputFile;

            fileStream.on('error', (err) => {
                throw err;
             })

             const rl = readline.createInterface({
                input:<Readable>fileStream,
            });
        
            let async_itr = rl[Symbol.asyncIterator]();    

            return  readLineByStream(parameters,async_itr); 
        }
        return this;

      } 
    }
}


async function readLineByStream(parameters:InitParameters ,async_itr:AsyncIterableIterator<{}>):Promise<IterableInterface> {

    return {
        [Symbol.asyncIterator]() {
            return this;
        },
         async next() {
                      
            let data =  await readMoreData(parameters,async_itr); 
            if(data.length== 0){
                return new Promise((resolve, reject) => {
                    resolve({done : true}  )
            });
            }
            else{
                return new Promise((resolve, reject) => {
                    resolve({value:data, done : false}  )
            });
            }
        }
    }
}

async function  readMoreData(parameters:InitParameters ,asyncIterator :AsyncIterableIterator<object>):Promise<Array<object>>{

    let count = 0;
    let arr:Array<object> = [];


    while(count < parameters.chunkSize){
        const resolved_obj  =  await asyncIterator.next();
        if(!resolved_obj.done){
            arr.push(resolved_obj);
        }
        count++;
    }


    return  arr;
}




// async function  readMoreData(parameters:InitParameters ,asyncIterator :AsyncIterableIterator<object>):Promise<Array<object>>{

//     let count = 0;
//     let arr:Array<object> = [];

//     let currentChunkSize = 0 ;
//     if(parameters.hasOwnProperty("specialChunkSize") &&  parameters.specialChunkSize![0] !== 0 ) {
//         currentChunkSize = parameters.specialChunkSize![chunkCounter]
//     }
//     else {
//         currentChunkSize = parameters.chunkSize
//     }


//     while(count < currentChunkSize){
//         const resolved_obj  =  await asyncIterator.next();
//         if(!resolved_obj.done){
//             arr.push(resolved_obj);
//         }
//         count++;
//     }

  
//     if(parameters.hasOwnProperty("specialChunkSize")){
//         chunkCounter++;
//     }

//     return  arr;
// }




function skipRow(parameters:InitParameters ,asyncIterator :AsyncIterableIterator<{}>) {

    let count = 0;
    
    while(count <  parameters.skipRows!){
       asyncIterator.next();
       count++;
    }

    return asyncIterator;
} 