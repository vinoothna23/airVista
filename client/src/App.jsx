import './App.css'
import React from 'react';
import {Route, Routes} from "react-router-dom"
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import {UserContextProvider} from "./UserContext";
import Layout from './Layout'
import { useState } from 'react'
import RegisterPage from './pages/RegisterPage'
import axios from "axios";
import AccountPage from './pages/AccountPage';
import PlacesPage from './pages/PlacesPage';
import PlacesFormPage from './pages/PlacesFormPage';

axios.defaults.baseURL = 'http://192.168.29.23:4000/';
axios.defaults.withCredentials = true;

function App() {
  const [count, setCount] = useState(0)

  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account/:subpage?" element={<AccountPage />} />
        <Route path="/account/places" element={<PlacesPage />} />
        <Route path="/account/places/new" element={<PlacesFormPage />} />
        <Route path="/account/places/:id" element={<PlacesFormPage />} />
        

      </Route>
    </Routes>
    </UserContextProvider>
    
  )
}

export default App
