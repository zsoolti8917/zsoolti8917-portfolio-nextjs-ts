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

/**
 * One row of the timeline: a fixed mono column of dates on the left, the job
 * on the right, a hairline above. The rule above each row (rather than below)
 * is what makes the last item stop cleanly instead of trailing a border into
 * the gap before the next section.
 */
export const ExperienceItem = ({ job }: { job: Job }) => {
  return (
    <div className="grid gap-x-8 border-t border-hairline py-8 md:grid-cols-[9rem_1fr]">
      <Reveal width="100%">
        {/* tabular-nums keeps "2022 — 2024" and "2024 — present" on the same
            digit grid, so the column reads as a column. */}
        <div className="mb-4 font-mono mono-1 text-xs leading-relaxed text-fg-3 tabular-nums md:mb-0">
          <p>{job.dates}</p>
          <p>{job.location}</p>
        </div>
      </Reveal>

      <div>
        <Reveal width="100%">
          <div>
            <h3 className="text-lg font-semibold text-fg">{job.jobTitle}</h3>
            <p className="text-fg-2">{job.companyName}</p>
          </div>
        </Reveal>

        <Reveal width="100%">
          <ul className="my-6 list-disc space-y-4 pl-4 text-sm leading-relaxed text-fg-2 marker:text-fg-3">
            {job.responsibilities.map((item, index) => (
              <li key={index}>
                <span className="font-medium text-fg">{item.title}</span>
                <p className="mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal width="100%">
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <Chip key={index}>{skill}</Chip>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
};
