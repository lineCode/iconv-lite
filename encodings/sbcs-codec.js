
// Single-byte codec. Needs a 'chars' string parameter that contains 256 or 128 chars that
// correspond to encoded bytes (if 128 - then lower half is not changed). 

// sbcs-data.json is generated by /generation/gen-sbcs.js, don't change it manually.

exports._sbcs = function(options, iconv) {
    if (!options)
        throw new Error("SBCS codec is called without the data.")
    
    // Prepare char buffer for decoding.
    if (!options.charsBuf) {
        if (!options.chars || (options.chars.length !== 128 && options.chars.length !== 256))
            throw new Error("Encoding '"+options.type+"' has incorrect 'chars' (must be of len 128 or 256)");
        
        if (options.chars.length === 128) {
            var asciiString = "";
            for (var i = 0; i < 128; i++)
                asciiString += String.fromCharCode(i);
            options.chars = asciiString + options.chars;
        }

        options.charsBuf = new Buffer(options.chars, 'ucs2');
    }
    
    // Reverse buffer for encoding.
    if (!options.revCharsBuf) {
        options.revCharsBuf = new Buffer(65536);
        var defChar = iconv.defaultCharSingleByte.charCodeAt(0);
        for (var i = 0; i < options.revCharsBuf.length; i++)
            options.revCharsBuf[i] = defChar;
        for (var i = 0; i < options.chars.length; i++)
            options.revCharsBuf[options.chars.charCodeAt(i)] = i;
    }

    return {
        encode: encodeSingleByte,
        decode: decodeSingleByte,
        options: options,
    };
}

function encodeSingleByte(str) {
    var buf = new Buffer(str.length);
    var revCharsBuf = this.options.revCharsBuf;
    for (var i = 0; i < str.length; i++)
        buf[i] = revCharsBuf[str.charCodeAt(i)];
    
    return buf;
}

function decodeSingleByte(buf) {
    // Strings are immutable in JS -> we use ucs2 buffer to speed up computations.
    var charsBuf = this.options.charsBuf;
    var newBuf = new Buffer(buf.length*2);
    var idx1 = 0, idx2 = 0;
    for (var i = 0, _len = buf.length; i < _len; i++) {
        idx1 = buf[i]*2; idx2 = i*2;
        newBuf[idx2] = charsBuf[idx1];
        newBuf[idx2+1] = charsBuf[idx1+1];
    }
    return newBuf.toString('ucs2');
}

