import React from 'react'
import { FaGithub, FaLinkedin } from "react-icons/fa";

function Team() {
  const people = [
    {
      name: "Rakindu Niwunhella",
      role: "Full-Stack Developer",
      imageUrl:
        "/images/rakindu.webp",
      github: "https://github.com/RakinduNiwunhella",
      linkedin: "https://www.linkedin.com/in/rakindu-niwunhella-388b41307?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3Bngmhzz0WS%2FCdnSjZnlmA%2Fg%3D%3D"
    },
    {
      name: "Sanila Wijesekara",
      role: "AI and backend engineer",
      imageUrl:
        "/images/sanila.webp",
      github: "https://github.com/Sanila-577",
      linkedin: "https://www.linkedin.com/in/sanila-wijesekara"
    },
    {
      name: "Chethina Fernando",
      role: "Database architect",
      imageUrl:
        "/images/chethina.webp",
      github: "https://github.com/Chethi2003",
      linkedin: "https://www.linkedin.com/in/fernandochethina2003?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B7O6IhD1nTBKlh46cnMe3mw%3D%3D"
    },
    {
      name: "Binada Matara Arachchige",
      role: "Backend engineer",
      imageUrl:
        "/images/binada.webp",
      github: "https://github.com/binadacode",
      linkedin: "https://www.linkedin.com/in/binada-matara-arachchige-078b30226?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BsBhP2K9MSS2XuyZ7XN3f4w%3D%3D"
    },
    {
      name: "Pavithma Fernando",
      role: "Frontend engineer",
      imageUrl:
        "/images/pavithma.webp",
      github: "https://github.com/pavithma",
      linkedin: "https://www.linkedin.com/in/pavithma-fernando-1a8468324?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BSS8l6wDyQZil2h3pj7AO0Q%3D%3D"
    },
    {
      name: "Sithuli Basnayake",
      role: "UI/UX designer",
      imageUrl:
        "/images/sithuli.webp",
      github: "https://github.com/basnayake4",
      linkedin: "https://www.linkedin.com/in/sithuli-basnayake-42101022a?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BEw7JM8gITt2SJLYJUcagMQ%3D%3D"
    },
  ];

  return (
    <div className="py-16 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Title */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Our team
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            We’re a dynamic group of individuals who are passionate about what we
            do and dedicated to delivering the best results for our clients.
          </p>
        </div>

        {/* Grid */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 ">
          {people.map((person) => (
            <div
              key={person.name}
              className="text-center transform transition-all duration-300 ease-in hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden bg-white p-4 dark:bg-gray-950"
            >
              <img
                className="mx-auto h-85 w-95 object-cover rounded-lg"
                src={person.imageUrl}
                alt={person.name}
              />
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                {person.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{person.role}</p>

              {/* Icons */}
              <div className="mt-4 flex items-center justify-center gap-x-4">
                <a
                  href={person.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${person.name} GitHub`}
                  className="text-gray-400 hover:text-green-600 dark:text-white dark:hover:text-green-500"
                >
                    <FaGithub className="w-6 h-6" />
                </a>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${person.name} LinkedIn`}
                  className="text-gray-400 hover:text-blue-600 dark:text-white dark:hover:text-blue-500"
                >
                    <FaLinkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default Team