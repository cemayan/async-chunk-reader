# Async Chunk Reader

This library allows you to read large amounts of data in chunks.

## Install
```console
npm install --save async-chunk-reader
```

## API
---

**init(parameters : InitParameters)**

> input : InitParameters

- **chunk_size** :   String 
- **input_file** : String | Stream
- **encoding** : String

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
            chunk_size: 100000,
            input_file: 'input/mobile_network_201805.csv.gz'
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
            input_file:  process.stdin
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
            input_file: "Some string"
        })
        .get()

    for await(let chunk of  data){
        console.log(chunk.map(d=>d.value))
    }
}

main();

```




