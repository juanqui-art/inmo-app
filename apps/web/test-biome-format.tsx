// Test file for Biome formatter verification
// This file intentionally has messy formatting to test Biome integration

// Test 1: Object formatting
const data={foo:"bar",items:[1,2,3],active:true,email:"user@example.com"}

// Test 2: Function formatting
function hello(){return"world"}

// Test 3: React component
const Button=({onClick,label})=>{return <button onClick={onClick}>{label}</button>}

// Test 4: Array formatting
const items=[{id:1,name:"Item 1"},{id:2,name:"Item 2"},{id:3,name:"Item 3"}]

// Test 5: Conditional
if(value>10){console.log("large")}else{console.log("small")}

// Test 6: Accessibility issue (should show a11y warning)
export const BadButton=()=><button onClick={handleClick}>Click me</button>

// Test 7: TypeScript types
interface User{id:number;name:string;email:string;active:boolean}

// Test 8: Long imports
import{useState,useEffect,useCallback,useMemo,useRef}from"react"

export default function TestComponent(){
  return<div>Test</div>
}
