from rest_framework import serializers

from .models import Classroom


class ClassroomSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    facility_name = serializers.ReadOnlyField(source='facility.name')
    is_in_use = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = '__all__'

    def get_is_in_use(self, obj) -> bool:
        return obj.is_in_use()

