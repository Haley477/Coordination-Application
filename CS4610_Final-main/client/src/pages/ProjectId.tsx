import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ArrowIcon from "@mui/icons-material/ArrowDropDown"
import "../styles/ProjectId.css";

interface Project {
    id: string;
    name: string;
    description: string;
    isActive?: boolean;
    memberships?: ProjectMembership[];
    todoLists?: ToDoList[];
    boards?: DiscussionBoard[];
}

interface ProjectMembership {
    projectId: string;
    userId: string;
    role: "USER" | "ADMIN" | "OWNER";
}
interface User {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
}

interface ToDoList {
    name: string;
    description?: string;
}
interface DiscussionBoard {
    name: string;
    description?: string;
}


function ProjectId() {
    const { id } = useParams<{ id: string }>();
    
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [projectMembers, setProjectMembers] = useState<User[]>([]);
    const [userDropdown, setUserDropdown] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
          setIsLoading(false);
          return;
        }

        const fetchProject = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/projects/${id}`);
                const projData: Project = response.data;

                if (projData) {
                    setProject(projData);
                }
                else {
                    console.error("Project not found");
                    alert("Project not found. Please try again.");
                }

            } catch (error) {
                console.error("Error while fetching project:", error);
            }
        };
      
        fetchProject();
    }, [user, authLoading]);

    useEffect(() => {
        if (!project?.id) return;

        const fetchMembers = async () => {
            try {
                // Now fetch project members
                const membersResponse = await axios.get(
                    `http://localhost:3000/api/projects/${project?.id}/members`
                );
                
                setProjectMembers(membersResponse.data);

                setIsLoading(false);
            } catch (error) {
                console.error("Error while fetching users:", error);
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [project]);

    function getUserWithId(userId: string): User | undefined {
        return projectMembers.find((member) => member.id === userId);
    }

    if (authLoading || isLoading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <div>Please log in to access the project.</div>;
    }
    
    return (
        <div className="screen">
            <header className="project-info">
                <h1>{project?.name}</h1>
                <p>{project?.description}</p>
                <p>Project Status: {project?.isActive ? "Active" : "Inactive"}</p>
            </header>
            <div className="dropdown-content">
                <div className="user-dropdown-header" onClick={() => setUserDropdown(!userDropdown)}>
                    <span>Users</span><span><ArrowIcon/></span>
                </div>
                {userDropdown && (
                    <div className="user-dropdown">
                        {project?.memberships?.map((membership) => (
                            <div key={membership.userId} className="user-item">
                                <div className="user-names">
                                    <p>{getUserWithId(membership.userId)?.username}</p>
                                    <p>{getUserWithId(membership.userId)?.firstName || ""} {getUserWithId(membership.userId)?.lastName || ""}</p>
                                </div>
                                <p>Role: {membership.role}</p>
                            </div>
                        ))}
                    </div>
                )}
                <p className="code">Invite Code: {project?.id}</p>
            </div>
            <div className="buttons">
                <button className="navigate-button" onClick={() => navigate("/todolist")}>To-do List</button>
                <button className="navigate-button" onClick={() => navigate("/discussion")}>Discussion Boards</button>
            </div>
        </div>
    )
}

export default ProjectId;