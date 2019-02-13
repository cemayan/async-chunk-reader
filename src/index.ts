import fs from "fs";
import path from "path"
import readline from "readline"
import zlib from "zlib"
import { Stream } from "stream";
import events from "events";

const gunzip = zlib.createGunzip();

export interface InitParameters{
    chunk_size : number,
    encoding : string,
    input_file : String|Stream,
}

export interface ReaderParameters{
    input_file : String|Stream
}


events.EventEmitter.defaultMaxListeners = 1000;
const default_global_settings = {chunk_size : 10000, encoding : "utf8" };

export function init(parameters : InitParameters){
    default_global_settings.chunk_size = parameters.chunk_size;
    default_global_settings.encoding = parameters.encoding;

    return { get(){

        let fileStream;

        if(typeof(parameters.input_file) == "string"){
            if(path.extname(<string>parameters.input_file)==".gz"){
                fileStream = fs.createReadStream(<string>parameters.input_file,{ encoding:default_global_settings.encoding }).pipe(gunzip);
            }  
            else{
                fileStream = fs.createReadStream(<string>parameters.input_file,{ encoding:default_global_settings.encoding });
            }

            fileStream.on('error', (err) => {
               throw err;
            })

            const rl = readline.createInterface({
                input: fileStream,
            });
        
            let async_itr =  rl[Symbol.asyncIterator]();   
                
            return  readLineByStream(async_itr); 
        }  
        else if(parameters.input_file instanceof Stream ){
            fileStream = parameters.input_file;

            fileStream.on('error', (err) => {
                throw err;
             })

             const rl = readline.createInterface({
                input: fileStream,
            });
        
            let async_itr =  rl[Symbol.asyncIterator]();    

            return  readLineByStream(async_itr); 
        }
        return this;

      } 
    }
}


async function readLineByStream(async_itr) {

    return {
        [Symbol.asyncIterator]() {
            return this;
        },
         async next() {
                      
            let data =  await readMoreData(async_itr); 
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

async function  readMoreData(asyncIterator :AsyncIterator<any>):Promise<Array<any>>{

    let count = 0;
    let arr:Array<object> = [];

    while(count < default_global_settings.chunk_size){
        const resolved_obj  =  await asyncIterator.next();
        if(!resolved_obj.done){
            arr.push(resolved_obj);
        }
        count++;
    }
    return  arr;
}


