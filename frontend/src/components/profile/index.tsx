import React, {useEffect, useState} from "react";
import {useAppDispatch, useUserSelector} from "../../store/hooks";
import {getUser} from "../../store/user";
import jwt from 'jsonwebtoken';

function Profile() {
    const sessionToken: string = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2FvQGdtYWlsLmNvbSIsImlhdCI6MTcxMjE3MTczOCwiZXhwIjoxNzEyMTc1MzM4fQ.kHqYTlRQlFXZqoqVG0-Bs7pY433sGOlLDaoeFLUKUBob0_SrjNB1vs_czB0DWCdsRGd-KbzgtcWirMaIx5W7aA";
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

    return (<div>
                <h2>User Profile</h2>
                {!editingData ? (
                    <>
                        <p>Name: {user?.name}</p>
                        <p>Email: {user?.email}</p>
                        <p>Phone Number: {user?.phoneNumber}</p>
                        <p>Company: {user?.company}</p>
                        <p>Role: {user?.role}</p>
                    </>
                ) : (
                    <>
                    </>
                )}
            </div>
    );
}

export default Profile;