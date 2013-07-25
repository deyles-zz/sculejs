# SculeJS

[![Build Status](https://travis-ci.org/dan-eyles/sculejs.png?branch=master)](https://travis-ci.org/dan-eyles/sculejs)

## What is SculeJS?

*SculeJS* (from Minuscule - pronounced **skyul**) is a fully featured DBMS written in JavaScript that emulates the functionality of [MongoDB](http://www.mongodb.org/). It's also
much more than that; *SculeJS* includes implementations of many general purpose data structures that can be used by developers in their day-to-day work.

I originally built [JSONDB](https://github.com/irlgaming/jsondb-public "JSONDB") for use in Titanium Appcelerator apps, but over time
it became apparent that a similar system could be really useful for other stuff as well. *SculeJS* can run in your web browser, in a NodeJS 
process, or even inside iOS and Android applications including a JavaScript runtime environment.

*SculeJS* provides a high-performance NoSQL database management system with the following features:

* Document-oriented storage
* Fast in-place updates
* Rich document based queries
* Support for Map/Reduce operations
* Support for geo-locational queries using the $where and $near operators

Data structures currently included in *SculeJS* are:

* [Hash Map](http://en.wikipedia.org/wiki/Hash_Table  "Hash Map")
* [Hash Table](http://en.wikipedia.org/wiki/Hash_Table "Hash Table")
* [Binary Search Tree](http://en.wikipedia.org/wiki/Binary_Search_Tree "Binary Search Tree")
* [Bloom Filter](http://en.wikipedia.org/wiki/Bloom_Filter "Bloom Filter")
* [Linked List](http://en.wikipedia.org/wiki/Linked_List "Linked List")
* [Doubly Linked List](http://en.wikipedia.org/wiki/Linked_List#Doubly_linked_list "Doubly Linked List")
* [Caching Linked List](http://en.wikipedia.org/wiki/Linked_List "Caching Linked List")
* [LRU Cache](http://en.wikipedia.org/wiki/LRU_cache#Least_Recently_Used "LRU Cache")
* [LIFO Stack](http://bit.ly/v0kKey "LIFO Stack")
* [FIFO Stack](http://bit.ly/v0kKey "FIFO Stack")
* [Queue](http://bit.ly/v0kKey "Queue")
* Atomic Counter
* [Bit Set](http://en.wikipedia.org/wiki/Bit_array "Bit Set")

## Where's the documentation?

I do my best to keep the JSDoc annotation in the source up to date with changes, sometimes I miss things though. To generate a HTML version of the API reference for _SculeJS_
clone a copy of the [jsdoc3 repository](https://github.com/jsdoc3/jsdoc) and follow the instructions in the README.md file there.

You should be able to generate JSDoc for _SculeJS_ using the following commands (assuming the sculejs and jsdoc directories are at the same level):

    $ cd jsdoc
    $ ./jsdoc ../sculejs/lib/*.js

If you have any specific questions about how to use _SculeJS_ then head on over to the [project wiki](https://github.com/dan-eyles/sculejs/wiki).

## Do you use any coding standards?

I run all core library code through [JSHint](http://jshint.com/) as part of my (currently manual) build process. Building code for other platforms such as web and Titanium
takes a little bit of manual fiddling, so certain portions don't pass. It all runs though, and all test cases are verified by running mocha before any commits to TRUNK.

## How does it work?

*SculeJS* stores collections of JavaScript objects in memory and processes query expressions by compiling them to JavaScript before evaluating them against collection data.
Using *SculeJS* to perform queries is actually pretty similar to using the MongoDB query shell - most operators are supported.

Collections can be persisted to disk (using LocalStorage in the browser), or other storage mediums using custom storage managers. At the time of writing I'm working on
support for [IndexDB](http://www.w3.org/TR/IndexedDB/ "IndexDB") and [WebSQL](http://en.wikipedia.org/wiki/Web_SQL_Database "WebSQL") storage engines.

## Can I contribute/donate/help in some way?

If you want to help out with developing *SculeJS* please take a look at the [contributor wiki guide](https://github.com/dan-eyles/sculejs/wiki/Guide-To-Contributing), I'd be happy to have some help. Donations aren't necessary - if you 
use *SculeJS* and love it then tell your friends, just getting the word out would be a huge help.

I have a full time job and maintain *SculeJS* in my spare time, so if I don't get to your tickets immediately please don't take it personally.