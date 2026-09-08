import { EntityRecord } from '@igo2/common/entity';
import {
  Feature,
  FeatureMotion,
  FeatureStore,
  IgoMap,
  moveToOlFeatures
} from '@igo2/geo';

export function moveToFeatureStore<T extends Feature>(
    map: IgoMap,
    store: FeatureStore<T>
  ) {
    const olSource = store.layer.ol.getSource();

    let olFeatures = store.stateView
      .manyBy((record: EntityRecord<T>) => record.state.selected === true)
      .map((record: EntityRecord<T>) =>
        olSource.getFeatureById(store.getKey(record.entity))
      );

    if (olFeatures.length === 0) {
      olFeatures = olSource.getFeatures();
    }

    if (olFeatures.length === 0) {
      return;
    }

    moveToOlFeatures(
      map.viewController,
      olFeatures,
      FeatureMotion.Zoom,
      [0, 0, 0.8, 0.6]
    );
}
