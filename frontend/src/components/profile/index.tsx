import React, {useEffect, useState} from "react";
import {useAppDispatch, useUserSelector} from "../../store/hooks";
import {getUser} from "../../store/user";
import jwt from 'jsonwebtoken';

function Profile() {
    const sessionToken: string = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2FvQGdtYWlsLmNvbSIsImlhdCI6MTcyNzM3MzU2MCwiZXhwIjoxNzMwMDAxNjU2fQ.OFdGB8u3r8kLx-KZxqJc7R6i06D2ytAue8Hp0_kZEP4-21b9WhPo1_Xrq-svMgoRZoRYKBi8-wYxohtFCXN2BA";
    const email: string = "joao@gmail.com"
    /*const decodedToken = jwt.decode(sessionToken);
    if (decodedToken) {
        console.log(decodedToken);
        console.log(decodedToken.sub);
        } else {
        console.log('Invalid token');
    }*/
    const dispatch = useAppDispatch()
    const user = useUserSelector((state) => state.user);

    useEffect(() => { dispatch(getUser(email, sessionToken))}, [dispatch, ""]);

    const [editingData, setEditingData] = useState(false)
    const [userCompany, setUserCompany]  = useState<string>("")

    const [updatedName, setUpdatedName] = useState<string>(user?.name || '');
    const [updatedEmail, setUpdatedEmail] = useState<string>(user?.email || '');
    const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState<number>(user?.phoneNumber || 0);


    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordStrength, setPasswordStrength] = useState<string>('Weak');


    useEffect(() => {
        setUserCompany("FCT NOVA")
        if(user?.email !== undefined && user?.name !== undefined && user?.phoneNumber !== undefined){
            setUpdatedName(user?.name)
            setUpdatedEmail(user?.email)
            setUpdatedPhoneNumber(user?.phoneNumber)
        }
    }, [user]);

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
    };

    const calculatePasswordStrength = (password: string) => {
        if (password.length > 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
            return 'Strong';
        } else if (password.length > 5) {
            return 'Medium';
        }
        return 'Weak';
    };

    return (
        <div
            className="wrapper full-screen" style={{paddingTop: '20px'}}>
            <div
                className="profile-container">
                <h2 className="profile-header">User
                    Profile</h2>
                {!editingData ? (
                    <div
                        className="profile-info">
                        <p className="profile-item">
                            <strong>Name:</strong> {user?.name || "Loading..."}
                        </p>
                        <p className="profile-item">
                            <strong>Email:</strong> {user?.email || "Loading..."}
                        </p>
                        <p className="profile-item">
                            <strong>Phone
                                Number:</strong> {user?.phoneNumber || "Loading..."}
                        </p>
                        <p className="profile-item">
                            <strong>Company:</strong> {userCompany || "Loading..."}
                        </p>
                        <p className="profile-item">
                            <strong>Role:</strong> {user?.role?.toUpperCase() || "Loading..."}
                        </p>
                        <button
                            className="edit-button-profile"
                            onClick={() => setEditingData(true)}>
                            Edit
                            Profile
                        </button>
                    </div>
                ) : (
                    <div>
                        <div
                            className="input-group-profile">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={updatedName}
                                onChange={(e) => setUpdatedName(e.target.value)}
                            />
                        </div>
                        <div
                            className="input-group-profile">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={updatedEmail}
                                onChange={(e) => setUpdatedEmail(e.target.value)}
                            />
                        </div>
                        <div
                            className="input-group-profile">
                            <label>Phone
                                Number:</label>
                            <input
                                type="number"
                                value={updatedPhoneNumber}
                                onChange={(e) => setUpdatedPhoneNumber(Number(e.target.value))}
                            />
                        </div>
                        <h3 className="password-title">Change
                            Password</h3>
                        <div
                            className="input-group-profile">
                            <label>New
                                Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                            />
                            <p>Password
                                Strength: <strong>{passwordStrength}</strong>
                            </p>
                        </div>
                        <div
                            className="input-group-profile">
                            <label>Confirm
                                Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button
                            className="save-button-profile"
                            onClick={() => {
                                if (password !== confirmPassword) {
                                    alert("Passwords do not match!");
                                } else {
                                    setEditingData(false);
                                }
                            }}
                            style={{marginTop: '20px'}}
                        >
                            Save
                            Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;