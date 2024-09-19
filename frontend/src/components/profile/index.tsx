import React, {useEffect, useState} from "react";
import {useAppDispatch, useUserSelector} from "../../store/hooks";
import {getUser} from "../../store/user";
import jwt from 'jsonwebtoken';

function Profile() {
    const sessionToken: string = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2FvQGdtYWlsLmNvbSIsImlhdCI6MTcyNDY4ODA1MywiZXhwIjoxNzI3MzE2MTQ5fQ.JhIkuaIYSxCe1km_YkmDEZF0VK6DvobmLeZcHO0KSD-vmPV32mI4g6x63Ch2fVVq3VLCW7XcmuTbpNlY6bZkkQ";
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

    //const [selectedName, setSelectedName] = useState<string | null>('');
    //const [selectedEmail, setSelectedEmail] = useState<string | null>('');
    //const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<number | null>(0);

    const [editingData, setEditingData] = useState(false)
    const [userCompany, setUserCompany]  = useState<string>("")

    useEffect(() => {
        setUserCompany("FCT NOVA")
    }, [user]);

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
                        <p>Edit Personal Data
                            </p>
                        <button
                            className="save-button-profile"
                            onClick={() => setEditingData(false)}>
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