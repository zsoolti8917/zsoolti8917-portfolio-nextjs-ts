import { Chip } from "../util/Chip";
import Reveal from "../util/Reveal";

export interface Job {
  companyName: string;
  dates: string;
  jobTitle: string;
  location: string;
  responsibilities: { title: string; description: string }[];
  skills: string[];
}

export const ExperienceItem = ({ job }: { job: Job }) => {
  return (
    <div className="mb-6 border-b pb-6 border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <Reveal>
          <span className="font-bold text-xl">{job.companyName}</span>
        </Reveal>
        <Reveal>
          <span>{job.dates}</span>
        </Reveal>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Reveal>
          <span className="text-indigo-300 font-bold">{job.jobTitle}</span>
        </Reveal>
        <Reveal>
          <span>{job.location}</span>
        </Reveal>
      </div>

      <Reveal>
        <div className="mb-6 text-zinc-300 leading-relaxed">
          {job.responsibilities.map((item, index) => (
            <div key={index} className="mb-4 flex items-start">
              <span className="mr-2 text-gray-500">&#8226;</span>
              <div>
                <span className="font-bold">{item.title}</span>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill, index) => (
            <Chip key={index}>{skill}</Chip>
          ))}
        </div>
      </Reveal>
    </div>
  );
};
