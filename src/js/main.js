"use strict";

import browserUpdate from 'browser-update';
browserUpdate({
  required: {e:-2,f:-6,o:-6,s:10,c:-6},
  insecure:true,
  unsupported:true,
  reminder:0,
  reminderClosed: 1
});

const autor = 'Kasia Izak';
console.log(`Hej, nazywam się ${autor} i jestem autorką tej strony.
Fajnie, że nie boisz się zaglądać do konsoli! ;-)`);
