import { Component } from '@angular/core';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';

type TopicStatus = 'completed' | 'in-progress' | 'locked' | 'not-started';

interface TopicCard {
  icon: IconName;
  titleKey: string;
  descriptionKey: string;
  status: TopicStatus;
  progress?: number;
  metaKey: string;
}

const TOPICS: TopicCard[] = [
  {
    icon: 'warning-sign',
    titleKey: 'lessons.topic.roadSigns.title',
    descriptionKey: 'lessons.topic.roadSigns.description',
    status: 'completed',
    metaKey: 'lessons.meta.questions15',
  },
  {
    icon: 'arrow-right',
    titleKey: 'lessons.topic.rightOfWay.title',
    descriptionKey: 'lessons.topic.rightOfWay.description',
    status: 'in-progress',
    progress: 40,
    metaKey: '',
  },
  {
    icon: 'lock',
    titleKey: 'lessons.topic.parking.title',
    descriptionKey: 'lessons.topic.parking.description',
    status: 'locked',
    metaKey: 'lessons.meta.unlockLevel4',
  },
  {
    icon: 'shield',
    titleKey: 'lessons.topic.defensiveDriving.title',
    descriptionKey: 'lessons.topic.defensiveDriving.description',
    status: 'not-started',
    metaKey: 'lessons.meta.minutes22',
  },
  {
    icon: 'wrench',
    titleKey: 'lessons.topic.vehicleBasics.title',
    descriptionKey: 'lessons.topic.vehicleBasics.description',
    status: 'completed',
    metaKey: 'lessons.meta.score98',
  },
  {
    icon: 'moon',
    titleKey: 'lessons.topic.nightDriving.title',
    descriptionKey: 'lessons.topic.nightDriving.description',
    status: 'not-started',
    metaKey: 'lessons.meta.lessons12',
  },
];

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [TranslatePipe, IconComponent, TopBarComponent],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss',
})
export class LessonsComponent {
  protected readonly topics = TOPICS;
  protected readonly lessonsDone = 12;
  protected readonly lessonsTotal = 20;

  statusKey(status: TopicStatus): string {
    return `lessons.status.${status}`;
  }
}
