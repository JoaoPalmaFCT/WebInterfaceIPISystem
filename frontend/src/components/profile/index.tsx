import React, {useEffect, useState} from "react";
import {useAppDispatch, useUserSelector} from "../../store/hooks";
import {getUser} from "../../store/user";
import jwt from 'jsonwebtoken';

function Profile() {
    const sessionToken: string = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2FvQGdtYWlsLmNvbSIsImlhdCI6MTcxMjI0OTAwNywiZXhwIjoxNzEyMjUyNjA3fQ.V8pnB1U-3cxC1C9XwXg5E5RH01hgUQp3qbng_rRE81hXovygcYVVA0IH02_lnWqIiubYcGRllHqV7OxU7Tljnw";
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

                        return (<div className="main-wrapper full-screen">
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