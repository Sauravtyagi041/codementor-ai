"use client";
import {useEffect} from 'react';
export default function AuthComplete(){useEffect(()=>{try{sessionStorage.removeItem('codementor-code-draft');sessionStorage.removeItem('codementor-selected-problem');}catch{}window.location.replace('/');},[]);return <p>Opening your dashboard…</p>;}
