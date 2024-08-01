import { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_URL } from './config/Config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedUser, setIsLoggedUser] = useState(false);
    const [isLoggedAdmin, setIsLoggedAdmin] = useState(false);
    const [userData, setUserData] = useState({
        id: '',
        civility: '',
        lastname: '',
        firstname: '',
        dateOfBirth: '',
        email: '',
        role: '',
        token: ''
    });

    const [adminData, setAdminData] = useState({
        email: '',
        role: ''
    });

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const adminToken = await AsyncStorage.getItem('adminToken');

                if (userToken) {
                    const decodedToken = jwtDecode(userToken);
                
                    setIsLoggedUser(true);
                    setUserData({
                        id: decodedToken.id,
                        civility: decodedToken.civility,
                        lastname: decodedToken.lastname,
                        firstname: decodedToken.firstname,
                        dateOfBirth: decodedToken.dateOfBirth,
                        email: decodedToken.email,
                        role: decodedToken.role,
                        token: userToken
                    });
                }

                if (adminToken) {
                   const decodedToken = jwtDecode(adminToken);
                    setIsLoggedAdmin(true);
                    setAdminData({
                        email: decodedToken.email,
                        role: decodedToken.role
                    });
                } 
            } catch (error) {
                console.log(error);
            }
        };
        fetchToken();    
    }, []);

    const login = async (token) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            const response = await axios.get(`${API_URL}/user/info`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const userInfo = response.data;
            console.log(response.data);
            setIsLoggedUser(true);
            setUserData({
                id: userInfo.id,
                civility: userInfo.civility,
                lastname: userInfo.lastname,
                firstname: userInfo.firstname,
                dateOfBirth: userInfo.dateOfBirth,
                email: userInfo.email,
                role: userInfo.role,
                token: token 
            });
        } catch (error) {
            console.log('Failed to save token', error);
        }
    }

    const loginAdmin = async (token) => {
        try {
            await AsyncStorage.setItem('adminToken', token);
            const response = await axios.get(`${API_URL}/admin/info`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const adminInfo = response.data;
            console.log(response.data);
            setIsLoggedAdmin(true);
            setAdminData({
                email: adminInfo.email,
                role: adminInfo.role
            });
        } catch (error) {
            console.log('Failed to save token', error);
        }
    }

    const user = (newUserData) => {
        setIsLoggedUser(true);
        setUserData(newUserData);
    }

    const admin = (newAdminData) => {
        setIsLoggedAdmin(true);
        setAdminData(newAdminData);
    }

    const logout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('adminToken');
        setIsLoggedUser(false);
        setIsLoggedAdmin(false);
        setUserData({
            roles: []
        });
        setAdminData({
            roles: []       
        });
    }

    return (
        <AuthContext.Provider value={{ isLoggedUser, isLoggedAdmin, userData, adminData, user, admin, login, loginAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);