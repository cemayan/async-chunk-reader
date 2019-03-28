# Async Chunk Reader

This library allows you to read large amounts of data in chunks.

[Click to see how it works](https://runkit.com/cemayan/async-chunk-reader)



## Install
```console
npm install --save async-chunk-reader
```

## Changelog
> Added reading from zip file (v1.0.6) 
> Added skipRows (v.1.0.8)
> to be added in the future (v.1.0.9)

## API
---

**init(parameters : InitParameters)**

> input : InitParameters

- **chunk_size** :   String 
- **input_file** : String | Stream
- **encoding** : String
- **selectedFileName** String

**get()**

> output : Async Iterator


## Import

### with require : 
```javascript
const reader = require('async-chunk-reader')
```

### with import : 
```javascript
import * as reader from "async-chunk-reader"
```

## Usage
---

### with path : 

```javascript
async function main(){

    const data = await reader
        .init({
            chunkSize: 100000,
            inputFile: 'input/mobile_network_201805.csv.gz'
        })
        .get()

    for await(let chunk of  data){
        console.log(chunk.map(d=>d.value))
    }
}

main();

```

### with stream : 

```javascript
async function main(){

    const data = await reader
        .init({
            inputFile:  process.stdin
        })
        .get()

    for await(let chunk of  data){
        console.log(chunk.map(d=>d.value))
    }
}

main();

```


### with string : 

```javascript
async function main(){

    const data = await reader
        .init({
            inputFile: "Some string"
        })
        .get()

    for await(let chunk of  data){
        console.log(chunk.map(d=>d.value))
    }
}

main();

```


### with zipfile : 

```javascript
async function main(){

    const data = await reader
        .init({
            chunkSize: 100000,
            inputFile: 'example/Archive.zip',
            selectedFileName:'avocado.csv' #file in zip
        })
        .get()

    for await(let chunk of  data){
        console.log(chunk.map(d=>d.value))
    }
}

main();

```


### specialChunkSize : 

```javascript
async function main(){

    const data = await reader
        .init({
            chunkSize: 100000,
            inputFile: 'example/Archive.zip',
            specialChunkSize : {0:10000, 1:40000}
        })
        .get()

    for await(let chunk of  data){
        console.log(chunk.map(d=>d.value))
    }
}

main();

```





### to be added in the future (v.1.0.9)
### skipRows : 

```javascript
async function main(){

    const data = await reader
        .init({
            chunkSize: 100000,
            inputFile: 'example/Archive.zip',
            skipRows : 40000
        })
        .get()

    for await(let chunk of  data){
        console.log(chunk.map(d=>d.value))
    }
}

main();

```



