from tortoise.contrib.fastapi import HTTPNotFoundError
from typing import Type, TypeVar
from tortoise import Model

ModelType = TypeVar("ModelType", bound=Model)

async def get_object_or_404(model: Type[ModelType], **kwargs) -> ModelType:
    obj = await model.get_or_none(**kwargs)
    if not obj:
        raise HTTPNotFoundError(detail=f"{model.__name__} not found")
    return obj