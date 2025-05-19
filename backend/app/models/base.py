from tortoise import fields, models

class BaseModel(models.Model):
    id = fields.IntField(pk=True)
    
    class Meta:
        abstract = True