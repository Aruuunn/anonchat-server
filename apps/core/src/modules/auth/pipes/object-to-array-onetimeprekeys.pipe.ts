import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

// Has to be used during registration
@Injectable()
export class ObjectToArrayOnetimeprekeysPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      if (typeof value?.bundle?.oneTimePreKeys === 'object') {
        value.bundle.oneTimePreKeys = Object.values(
          value.bundle.oneTimePreKeys,
        );
      }
    } catch (e) {
      throw new BadRequestException();
    }

    return value;
  }
}
