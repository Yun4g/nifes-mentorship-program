import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import { useContext } from "react";


function ProfileId() {
    const { selectedMentee } = useContext(GlobalContext);
     
     if (!selectedMentee) {
        return <div>No mentee selected. Please go back and select a mentee.</div>;
     }

    return (
        <div>
                 <h1>{selectedMentee.first_name} {selectedMentee.last_name}</h1>
               <img src={selectedMentee.avatar} alt={`${selectedMentee.first_name} ${selectedMentee.last_name}`} />
             <p>{selectedMentee.email}</p>
        </div>
    );
}

export default ProfileId;