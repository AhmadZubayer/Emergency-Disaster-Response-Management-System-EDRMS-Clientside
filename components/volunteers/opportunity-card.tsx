import { Building2, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrganizationOpportunity } from './types';

interface OpportunityCardProps {
  opportunity: OrganizationOpportunity;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
}

const OpportunityCard = ({ opportunity, joined, joining, onJoin }: OpportunityCardProps) => {
  return (
    <article className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-medium">{opportunity.title}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="size-3.5" />{opportunity.organization_user?.name || 'Relief organization'}</p></div>
        <Badge variant={joined ? 'default' : 'secondary'}>{joined ? 'Joined' : opportunity.status}</Badge>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{opportunity.description}</p>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{opportunity.location}</span><span className="flex items-center gap-1.5"><Users className="size-3.5" />{opportunity.needed_volunteers} needed</span></div>
      {opportunity.disaster_name && <p className="text-xs"><span className="font-medium">Disaster:</span> {opportunity.disaster_name}</p>}
      <div className="flex flex-wrap gap-1.5">{opportunity.required_skills?.length ? opportunity.required_skills.map((skill) => <Badge key={skill} variant="outline">{skill.replaceAll('_', ' ')}</Badge>) : <span className="text-xs text-muted-foreground">No specific skills required</span>}</div>
      <div className="border-t border-border pt-4"><Button onClick={onJoin} disabled={joined || joining} className="w-full">{joining ? 'Joining...' : joined ? 'Already Joined' : 'Join Opportunity'}</Button></div>
    </article>
  );
};

export default OpportunityCard;
